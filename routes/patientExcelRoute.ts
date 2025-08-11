import express from "express";
import {
  exportPatientsToExcel,
  importPatientsFromExcel,
  downloadExcelTemplate,
} from "../controllers/patientExcelController";
import { isAutheticated, authorizeRoles } from "../middleware/authMiddleware";
import { uploadExcel } from "../middleware/multerConfig";

const patientExcelRouter = express.Router();

// Excel operations - Only ADMIN can access
patientExcelRouter.get("/export", isAutheticated, authorizeRoles("admin"), exportPatientsToExcel);
patientExcelRouter.get("/template", isAutheticated, authorizeRoles("admin"), downloadExcelTemplate);
patientExcelRouter.post(
  "/import",
  isAutheticated,
  authorizeRoles("admin"),
  uploadExcel,
  importPatientsFromExcel
);

export default patientExcelRouter;
