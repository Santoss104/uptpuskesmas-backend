import express from "express";
import {
  exportPatientsToExcel,
  importPatientsFromExcel,
  downloadExcelTemplate,
} from "../controllers/patientExcelController";
import { isAutheticated, authorizeRoles } from "../middleware/authMiddleware";
import { uploadExcel } from "../middleware/multerConfig";
import { excelRateLimit } from "../middleware/authRateLimit";

const patientExcelRouter = express.Router();

// Excel operations - Only ADMIN can access (with specialized rate limit)
patientExcelRouter.get(
  "/export",
  isAutheticated,
  authorizeRoles("admin"),
  excelRateLimit,
  exportPatientsToExcel
);
patientExcelRouter.get(
  "/template",
  isAutheticated,
  authorizeRoles("admin"),
  excelRateLimit,
  downloadExcelTemplate
);
patientExcelRouter.post(
  "/import",
  isAutheticated,
  authorizeRoles("admin"),
  excelRateLimit,
  uploadExcel,
  importPatientsFromExcel
);

export default patientExcelRouter;
