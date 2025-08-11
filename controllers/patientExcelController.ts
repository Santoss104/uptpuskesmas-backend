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

      const excelData = patients.map((patient) => ({
        Name: patient.name,
        Address: patient.address,
        "Registration Number": patient.registrationNumber,
        "Birth Day": `${patient.birthPlace}, ${patient.birthDay}`,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 25 }, // Name
        { wch: 35 }, // Address
        { wch: 20 }, // Registration Number
        { wch: 25 }, // Birth Day (Birth Place, Birth Date)
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

          let birthPlace = "";
          let birthDay = "";

          if (birthInfo) {
            const parts = birthInfo.split(", ");
            if (parts.length >= 2) {
              birthPlace = parts[0];
              birthDay = parts[1];
            } else {
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
      const workbook = XLSX.utils.book_new();

      // Create worksheet with simple data structure
      const worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "Address", "Registration Number", "Birth Day"],
        [
          "Ikhlas Abdillah",
          "Jl. Karya 2",
          "01.00.02.30",
          "Pekanbaru, 1985-05-20",
        ],
        [
          "Muhammad Revi Suryandi",
          "Jl. Karya 3",
          "01.00.02.31",
          "Rokan Hilir, 1985-05-20",
        ],
        [
          "Muhammad Azizi",
          "Jl. Karya 4",
          "01.00.02.32",
          "Taluk Kuantan, 1985-05-20",
        ],
      ]);

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Name
        { wch: 20 }, // Address
        { wch: 20 }, // Registration Number
        { wch: 25 }, // Birth Day
      ];
      worksheet["!cols"] = columnWidths;

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
