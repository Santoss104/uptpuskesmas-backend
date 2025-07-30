import express from "express";
import {
  getCalendar,
  getCurrentMonthCalendar,
  getMultipleMonths,
} from "../controllers/calendarController";
import { isAutheticated } from "../middleware/authMiddleware";

const calendarRouter = express.Router();

// Get current month calendar
calendarRouter.get("/current", isAutheticated, getCurrentMonthCalendar);

// Get specific month calendar
// Query params: month (1-12), year (YYYY)
calendarRouter.get("/", isAutheticated, getCalendar);

// Get multiple months calendar
// Query params: year (YYYY), startMonth (1-12), endMonth (1-12)
calendarRouter.get("/multiple", isAutheticated, getMultipleMonths);

export default calendarRouter;
