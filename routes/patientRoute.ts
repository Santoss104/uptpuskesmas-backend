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

// READ operations - Both USER and ADMIN can access
patientRouter.get("/total", isAutheticated, getTotalPatients);
patientRouter.get("/search", isAutheticated, searchPatients);
patientRouter.get("/search/name", isAutheticated, searchPatientsByName);
patientRouter.get("/search/address", isAutheticated, searchPatientsByAddress);
patientRouter.get("/search/alphabet", isAutheticated, getPatientsByAlphabet);
patientRouter.get("/", isAutheticated, getAllPatients);
patientRouter.get("/:id", isAutheticated, getPatientById);

// WRITE operations - Only ADMIN can access
patientRouter.post("/create", isAutheticated, authorizeRoles("admin"), createPatient);
patientRouter.put("/:id", isAutheticated, authorizeRoles("admin"), updatePatient);
patientRouter.delete("/:id", isAutheticated, authorizeRoles("admin"), deletePatient);

export default patientRouter;
