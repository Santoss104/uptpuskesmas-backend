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
import { crudRateLimit } from "../middleware/authRateLimit";

const patientRouter = express.Router();

// READ operations - Both USER and ADMIN can access (with high rate limit)
patientRouter.get("/total", isAutheticated, crudRateLimit, getTotalPatients);
patientRouter.get("/search", isAutheticated, crudRateLimit, searchPatients);
patientRouter.get(
  "/search/name",
  isAutheticated,
  crudRateLimit,
  searchPatientsByName
);
patientRouter.get(
  "/search/address",
  isAutheticated,
  crudRateLimit,
  searchPatientsByAddress
);
patientRouter.get(
  "/search/alphabet",
  isAutheticated,
  crudRateLimit,
  getPatientsByAlphabet
);
patientRouter.get("/", isAutheticated, crudRateLimit, getAllPatients);
patientRouter.get("/:id", isAutheticated, crudRateLimit, getPatientById);

// WRITE operations - Only ADMIN can access (with high rate limit)
patientRouter.post(
  "/create",
  isAutheticated,
  authorizeRoles("admin"),
  crudRateLimit,
  createPatient
);
patientRouter.put(
  "/:id",
  isAutheticated,
  authorizeRoles("admin"),
  crudRateLimit,
  updatePatient
);
patientRouter.delete(
  "/:id",
  isAutheticated,
  authorizeRoles("admin"),
  crudRateLimit,
  deletePatient
);

export default patientRouter;
