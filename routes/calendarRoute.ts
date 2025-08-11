import express from "express";
import {
  getCalendar,
  getCurrentMonthCalendar,
  getMultipleMonths,
} from "../controllers/calendarController";
import { isAutheticated } from "../middleware/authMiddleware";

const calendarRouter = express.Router();

calendarRouter.get("/current", isAutheticated, getCurrentMonthCalendar);
calendarRouter.get("/", isAutheticated, getCalendar);
calendarRouter.get("/multiple", isAutheticated, getMultipleMonths);

export default calendarRouter;
