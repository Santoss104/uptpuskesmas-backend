import express from "express";
import {
  exportPatientsToExcel,
  importPatientsFromExcel,
  downloadExcelTemplate,
} from "../controllers/patientExcelController";
import { isAutheticated } from "../middleware/authMiddleware";
import { uploadExcel } from "../middleware/multerConfig";

const patientExcelRouter = express.Router();

patientExcelRouter.get("/export", isAutheticated, exportPatientsToExcel);
patientExcelRouter.get("/template", isAutheticated, downloadExcelTemplate);
patientExcelRouter.post(
  "/import",
  isAutheticated,
  uploadExcel,
  importPatientsFromExcel
);

export default patientExcelRouter;
