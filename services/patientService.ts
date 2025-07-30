import PatientModel from "../models/patientModel";
import { Response } from "express";
import { ApiResponseHandler } from "../utils/apiResponse";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getAllPatientsService = async (
  res: Response,
  params: PaginationParams = {}
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = params;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build search query with better flexibility
  let searchQuery: any = {};

  if (search) {
    // Check if search is a single letter (for alphabet search)
    if (search.length === 1) {
      searchQuery = {
        name: { $regex: `^${search}`, $options: "i" },
      };
    } else {
      // Full text search across multiple fields
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { registrationNumber: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { birthPlace: { $regex: search, $options: "i" } },
        ],
      };
    }
  }

  // Build sort object
  const sortObject: any = {};
  sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

  try {
    // Get total count for pagination info AND overall total
    const totalPatients = await PatientModel.countDocuments(searchQuery);
    const overallTotal = await PatientModel.countDocuments(); // Total all patients

    // Get paginated patients
    const patients = await PatientModel.find(searchQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalPatients / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const responseData = {
      patients,
      pagination: {
        currentPage: page,
        totalPages,
        totalPatients, // Results matching search/filter
        patientsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      summary: {
        totalPatientsInDatabase: overallTotal,
        totalSearchResults: totalPatients,
        showingResults: patients.length,
        isFiltered: search ? true : false,
      },
    };

    return ApiResponseHandler.success(
      res,
      responseData,
      "Patients retrieved successfully",
      200,
      {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total: totalPatients,
          pages: totalPages,
        },
      }
    );
  } catch (error) {
    return ApiResponseHandler.error(
      res,
      "Error fetching patients",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

export const getTotalPatientsService = async (res: Response) => {
  try {
    const totalPatients = await PatientModel.countDocuments();

    // Get comprehensive statistics
    const stats = await PatientModel.aggregate([
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          latestRegistration: { $max: "$createdAt" },
          oldestRegistration: { $min: "$createdAt" },
        },
      },
    ]);

    // Get count by first letter of names (alphabet distribution)
    const alphabetStats = await PatientModel.aggregate([
      {
        $group: {
          _id: { $toUpper: { $substr: ["$name", 0, 1] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top addresses (most common locations)
    const topAddresses = await PatientModel.aggregate([
      {
        $group: {
          _id: "$address",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get registrations by month (last 12 months)
    const registrationTrend = await PatientModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return ApiResponseHandler.success(
      res,
      {
        totalPatients,
        statistics: stats[0] || {
          totalPatients,
          latestRegistration: null,
          oldestRegistration: null,
        },
        alphabetDistribution: alphabetStats,
        topAddresses,
        registrationTrend,
        summary: {
          total: totalPatients,
          mostCommonFirstLetter:
            alphabetStats.length > 0
              ? alphabetStats.reduce((max, current) =>
                  current.count > max.count ? current : max
                )._id
              : null,
          mostCommonAddress:
            topAddresses.length > 0 ? topAddresses[0]._id : null,
        },
      },
      "Total patients statistics retrieved successfully",
      200,
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return ApiResponseHandler.error(
      res,
      "Error retrieving total patients statistics",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

export const getPatientByIdService = async (id: string, res: Response) => {
  const patient = await PatientModel.findById(id);
  if (!patient) {
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });
  }
  res.status(200).json({
    success: true,
    patient,
  });
};
