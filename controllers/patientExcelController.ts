import { Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
import PatientModel from "../models/patientModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";

// Export patients to Excel
export const exportPatientsToExcel = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patients = await PatientModel.find().select("-__v").lean();

      if (patients.length === 0) {
        return next(new ErrorHandler("No patients found", 404));
      }

      const excelData = patients.map((patient, index) => ({
        No: index + 1,
        Name: patient.name,
        Address: patient.address,
        "Registration Number": patient.registrationNumber,
        "Birth Day": patient.birthDay,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set width kolom
      const columnWidths = [
        { wch: 5 },
        { wch: 25 },
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Patients Data");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      const fileName = `patients_data_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buffer);
    } catch (error) {
      return next(new ErrorHandler("Failed to export data", 500));
    }
  }
);

// Import patients from Excel
export const importPatientsFromExcel = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new ErrorHandler("Please upload an Excel file", 400));
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return next(new ErrorHandler("Excel file is empty", 400));
      }

      const importResults = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];

        try {
          const name = row["Name"] || row["name"];
          const address = row["Address"] || row["address"];
          const registrationNumber =
            row["Registration Number"] || row["registrationNumber"];
          const birthInfo = row["Birth Day"] || row["birthDay"];

          // Parse birth info to separate place and date
          let birthPlace = "";
          let birthDay = "";

          if (birthInfo) {
            const parts = birthInfo.split(", ");
            if (parts.length >= 2) {
              birthPlace = parts[0];
              birthDay = parts[1];
            } else {
              // If no comma, assume it's just the date
              birthDay = birthInfo;
              birthPlace = "Unknown";
            }
          }

          if (!name || !address || !registrationNumber || !birthDay) {
            importResults.failed++;
            importResults.errors.push(`Row ${i + 2}: Missing required fields`);
            continue;
          }

          const existingPatient = await PatientModel.findOne({
            registrationNumber,
          });
          if (existingPatient) {
            importResults.failed++;
            importResults.errors.push(
              `Row ${
                i + 2
              }: Registration number ${registrationNumber} already exists`
            );
            continue;
          }

          await PatientModel.create({
            name: String(name).trim(),
            address: String(address).trim(),
            registrationNumber: String(registrationNumber).trim(),
            birthPlace: String(birthPlace).trim(),
            birthDay: String(birthDay).trim(),
          });

          importResults.success++;
        } catch (error) {
          importResults.failed++;
          importResults.errors.push(
            `Row ${i + 2}: ${(error as Error).message}`
          );
        }
      }

      res.status(200).json({
        success: true,
        message: "Import completed",
        results: importResults,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to import data", 500));
    }
  }
);

// Download template Excel
export const downloadExcelTemplate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateData = [
        {
          Name: "John Doe",
          Address: "Jl. Contoh No. 123, Jakarta",
          "Registration Number": "REG001",
          "Birth Day": "Jakarta, 1990-01-15",
        },
        {
          Name: "Jane Smith",
          Address: "Jl. Sample No. 456, Bandung",
          "Registration Number": "REG002",
          "Birth Day": "Bandung, 1985-05-20",
        },
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      const columnWidths = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          ["TEMPLATE IMPORT PATIENT DATA"],
          ["Silakan isi data sesuai format di bawah ini:"],
          [],
          ["Name", "Address", "Registration Number", "Birth Day"],
        ],
        { origin: "A1" }
      );

      if (!worksheet["!merges"]) worksheet["!merges"] = [];
      worksheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
      worksheet["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });

      XLSX.utils.book_append_sheet(workbook, worksheet, "Patient Template");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="patient_import_template.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buffer);
    } catch (error) {
      return next(new ErrorHandler("Failed to generate template", 500));
    }
  }
);
