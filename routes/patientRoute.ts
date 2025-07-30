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

// ===== USER & ADMIN ENDPOINTS =====
// Both user and admin can access these

// Create patient (USER & ADMIN)
patientRouter.post("/create", isAutheticated, createPatient);

// Statistics endpoint (USER & ADMIN)
patientRouter.get("/total", isAutheticated, getTotalPatients);

// Read patients (USER & ADMIN)
patientRouter.get("/search", isAutheticated, searchPatients);
patientRouter.get("/search/name", isAutheticated, searchPatientsByName);
patientRouter.get("/search/address", isAutheticated, searchPatientsByAddress);
patientRouter.get("/search/alphabet", isAutheticated, getPatientsByAlphabet);
patientRouter.get("/", isAutheticated, getAllPatients);
patientRouter.get("/:id", isAutheticated, getPatientById);

// Update patient (USER & ADMIN)
patientRouter.put("/:id", isAutheticated, updatePatient);

// Delete patient (USER & ADMIN)
// Both users and admins can delete patients
patientRouter.delete("/:id", isAutheticated, deletePatient);

export default patientRouter;
