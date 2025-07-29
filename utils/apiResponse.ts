import { Response } from "express";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  errors?: string | string[];
}

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200,
    meta?: ApiResponse<T>["meta"]
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message = "Internal Server Error",
    statusCode = 500,
    errors?: string | string[]
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: string | string[],
    message = "Validation Error"
  ) {
    return this.error(res, message, 400, errors);
  }

  static notFound(res: Response, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = "Unauthorized access") {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = "Access forbidden") {
    return this.error(res, message, 403);
  }
}
