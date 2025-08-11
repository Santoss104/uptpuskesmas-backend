import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  searchPatientsByName,
  searchPatientsByAddress,
  getPatientsByAlphabet,
  getTotalPatients,
} from "../controllers/patientController";
import { isAutheticated, authorizeRoles } from "../middleware/authMiddleware";

const patientRouter = express.Router();

patientRouter.post("/create", isAutheticated, createPatient);
patientRouter.get("/total", isAutheticated, getTotalPatients);
patientRouter.get("/search", isAutheticated, searchPatients);
patientRouter.get("/search/name", isAutheticated, searchPatientsByName);
patientRouter.get("/search/address", isAutheticated, searchPatientsByAddress);
patientRouter.get("/search/alphabet", isAutheticated, getPatientsByAlphabet);
patientRouter.get("/", isAutheticated, getAllPatients);
patientRouter.get("/:id", isAutheticated, getPatientById);
patientRouter.put("/:id", isAutheticated, updatePatient);
patientRouter.delete("/:id", isAutheticated, deletePatient);

export default patientRouter;
