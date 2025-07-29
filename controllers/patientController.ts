import { Request, Response, NextFunction } from "express";
import PatientModel from "../models/patientModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import {
  getAllPatientsService,
  getPatientByIdService,
} from "../services/patientService";

// Create patient
export const createPatient = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, registrationNumber, birthPlace, birthDay } =
      req.body;

    if (!name || !address || !registrationNumber || !birthPlace || !birthDay) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const existing = await PatientModel.findOne({ registrationNumber });
    if (existing) {
      return next(new ErrorHandler("Registration number already exists", 400));
    }

    const patient = await PatientModel.create({
      name,
      address,
      registrationNumber,
      birthPlace,
      birthDay,
    });

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  }
);

// Get all patients
export const getAllPatients = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    await getAllPatientsService(res);
  }
);

// Get patient by ID
export const getPatientById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await getPatientByIdService(id, res);
  }
);

// Update patient
export const updatePatient = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const patient = await PatientModel.findById(id);
    if (!patient) {
      return next(new ErrorHandler("Patient not found", 404));
    }

    const updates = req.body;
    Object.assign(patient, updates);

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  }
);

// Delete patient
export const deletePatient = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const patient = await PatientModel.findById(id);
    if (!patient) {
      return next(new ErrorHandler("Patient not found", 404));
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  }
);

// Search patients by name or initial letter
export const searchPatients = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q, startsWith } = req.query;

    let query: any = {};

    if (q) {
      query.name = { $regex: q as string, $options: "i" };
    } else if (startsWith) {
      const regex = new RegExp(`^${startsWith}`, "i");
      query.name = { $regex: regex };
    }

    const patients = await PatientModel.find(query);

    res.status(200).json({
      success: true,
      data: patients,
    });
  }
);
