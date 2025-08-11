import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import { ApiResponseHandler } from "../utils/apiResponse";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: string;
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface CalendarMonth {
  month: string;
  year: number;
  weeks: CalendarWeek[];
  monthNumber: number;
}

// Get calendar data for a specific month and year
export const getCalendar = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { month, year } = req.query;

    // Default to current month/year if not provided
    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    // Validate month and year
    if (targetMonth < 0 || targetMonth > 11) {
      return next(new errorHandler("Invalid month. Must be between 1-12", 400));
    }

    if (targetYear < 1900 || targetYear > 2100) {
      return next(
        new errorHandler("Invalid year. Must be between 1900-2100", 400)
      );
    }

    const calendar = generateCalendar(targetYear, targetMonth);

    return ApiResponseHandler.success(
      res,
      calendar,
      "Calendar data retrieved successfully"
    );
  }
);

// Get current month calendar
export const getCurrentMonthCalendar = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const calendar = generateCalendar(now.getFullYear(), now.getMonth());

    return ApiResponseHandler.success(
      res,
      calendar,
      "Current month calendar retrieved successfully"
    );
  }
);

// Helper function to generate calendar data
function generateCalendar(year: number, month: number): CalendarMonth {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of the month and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Get today's date for comparison
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const weeks: CalendarWeek[] = [];
  let currentWeek: CalendarDay[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const dayDate = prevMonthLastDay - (firstDayOfWeek - 1 - i);

    currentWeek.push({
      date: dayDate,
      isCurrentMonth: false,
      isToday: false,
      dayOfWeek: dayNames[i],
    });
  }

  // Add all days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayOfWeek = new Date(year, month, day).getDay();

    currentWeek.push({
      date: day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === todayDate,
      dayOfWeek: dayNames[dayOfWeek],
    });

    // If we've filled a week (7 days), add it to weeks array
    if (currentWeek.length === 7) {
      weeks.push({ days: [...currentWeek] });
      currentWeek = [];
    }
  }

  // Add days from next month to complete the last week
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const dayOfWeek = (currentWeek.length + firstDayOfWeek) % 7;

      currentWeek.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false,
        dayOfWeek: dayNames[dayOfWeek],
      });
      nextMonthDay++;
    }
    weeks.push({ days: [...currentWeek] });
  }

  return {
    month: monthNames[month],
    year: year,
    monthNumber: month + 1,
    weeks: weeks,
  };
}

// Get multiple months (for year view or multi-month view)
export const getMultipleMonths = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { year, startMonth, endMonth } = req.query;

    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();
    const start = startMonth ? parseInt(startMonth as string) - 1 : 0;
    const end = endMonth ? parseInt(endMonth as string) - 1 : 11;

    // Validate inputs
    if (start < 0 || start > 11 || end < 0 || end > 11 || start > end) {
      return next(new errorHandler("Invalid month range", 400));
    }

    const calendars: CalendarMonth[] = [];

    for (let month = start; month <= end; month++) {
      calendars.push(generateCalendar(targetYear, month));
    }

    return ApiResponseHandler.success(
      res,
      {
        year: targetYear,
        months: calendars,
      },
      "Multiple months calendar retrieved successfully"
    );
  }
);
