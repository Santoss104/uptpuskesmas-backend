import { Request, Response, NextFunction } from "express";
import PatientModel from "../models/patientModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import {
  getAllPatientsService,
  getPatientByIdService,
  getTotalPatientsService,
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
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "name", // Default sort by name untuk alfabetis
      sortOrder = "asc", // Default ascending untuk alfabetis
    } = req.query;

    // Validate and convert parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10)
    ); // Max 100 per page

    const paginationParams = {
      page: pageNum,
      limit: limitNum,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder:
        (sortOrder as string).toLowerCase() === "asc"
          ? ("asc" as const)
          : ("desc" as const),
    };

    await getAllPatientsService(res, paginationParams);
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
    const { q, startsWith, page = 1, limit = 10 } = req.query;

    let query: any = {};

    if (q) {
      query.name = { $regex: q as string, $options: "i" };
    } else if (startsWith) {
      const regex = new RegExp(`^${startsWith}`, "i");
      query.name = { $regex: regex };
    }

    // Pagination for search results
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10)
    );
    const skip = (pageNum - 1) * limitNum;

    const totalPatients = await PatientModel.countDocuments(query);
    const patients = await PatientModel.find(query)
      .sort({ name: 1 }) // Always sort alphabetically
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalPatients / limitNum);

    res.status(200).json({
      success: true,
      data: {
        patients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPatients,
          patientsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  }
);

// Search patients by name specifically
export const searchPatientsByName = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, page = 1, limit = 10 } = req.query;

    if (!name) {
      return next(new ErrorHandler("Name parameter is required", 400));
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10)
    );
    const skip = (pageNum - 1) * limitNum;

    const query = { name: { $regex: name as string, $options: "i" } };

    const totalPatients = await PatientModel.countDocuments(query);
    const patients = await PatientModel.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalPatients / limitNum);

    res.status(200).json({
      success: true,
      message: `Found ${totalPatients} patients matching name "${name}"`,
      data: {
        patients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPatients,
          patientsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  }
);

// Search patients by address specifically
export const searchPatientsByAddress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { address, page = 1, limit = 10 } = req.query;

    if (!address) {
      return next(new ErrorHandler("Address parameter is required", 400));
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10)
    );
    const skip = (pageNum - 1) * limitNum;

    const query = { address: { $regex: address as string, $options: "i" } };

    const totalPatients = await PatientModel.countDocuments(query);
    const patients = await PatientModel.find(query)
      .sort({ name: 1 }) // Sort by name even when searching by address
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalPatients / limitNum);

    res.status(200).json({
      success: true,
      message: `Found ${totalPatients} patients in address "${address}"`,
      data: {
        patients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPatients,
          patientsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  }
);

// Get patients by alphabet (first letter of name)
export const getPatientsByAlphabet = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { letter, page = 1, limit = 10 } = req.query;

    if (!letter || (letter as string).length !== 1) {
      return next(new ErrorHandler("Single letter parameter is required", 400));
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10)
    );
    const skip = (pageNum - 1) * limitNum;

    const query = { name: { $regex: `^${letter}`, $options: "i" } };

    const totalPatients = await PatientModel.countDocuments(query);
    const patients = await PatientModel.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalPatients / limitNum);

    res.status(200).json({
      success: true,
      message: `Found ${totalPatients} patients with names starting with "${letter
        .toString()
        .toUpperCase()}"`,
      data: {
        patients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPatients,
          patientsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  }
);

// Get total count of all patients with statistics
export const getTotalPatients = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    await getTotalPatientsService(res);
  }
);
