import PatientModel from "../models/patientModel";
import { Response } from "express";

export const getAllPatientsService = async (res: Response) => {
  const patients = await PatientModel.find();
  res.status(200).json({
    success: true,
    patients,
  });
};

export const getPatientByIdService = async (id: string, res: Response) => {
  const patient = await PatientModel.findById(id);
  if (!patient) {
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });
  }
  res.status(200).json({
    success: true,
    patient,
  });
};
