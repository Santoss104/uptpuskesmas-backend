import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
} from "../controllers/patientController";
import { isAutheticated } from "../middleware/authMiddleware";

const patientRouter = express.Router();

patientRouter.post("/create", isAutheticated, createPatient);
patientRouter.get("/search", isAutheticated, searchPatients);
patientRouter.get("/", isAutheticated, getAllPatients);
patientRouter.get("/:id", isAutheticated, getPatientById);
patientRouter.put("/:id", isAutheticated, updatePatient);
patientRouter.delete("/:id", isAutheticated, deletePatient);

export default patientRouter;