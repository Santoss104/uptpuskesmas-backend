import multer from "multer";
import ErrorHandler from "../utils/errorHandler";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.endsWith(".xlsx") ||
    file.originalname.endsWith(".xls")
  ) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Only Excel files are allowed", 400));
  }
};

export const uploadExcel = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("excelFile");
