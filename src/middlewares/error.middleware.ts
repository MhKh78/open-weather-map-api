// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "class-validator";
import { ApiError } from "@utils/api-error"; // adjust path if needed

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("[ERROR]", err);

  // ➤ Handle DTO Validation Errors
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const formatErrors = (errors: ValidationError[]) =>
      errors.flatMap((e) =>
        Object.values(e.constraints || {}).map((message) => ({
          field: e.property,
          message,
        }))
      );

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: formatErrors(err),
    });
  }

  // ➤ Handle Custom ApiError (your custom class)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      statsuCode: err.statusCode,
      ...((err.details as any) && { details: err.details }),
    });
  }

  // ➤ Handle External API Errors (e.g. OpenWeather/Axios)
  if (err.isAxiosError) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || "Error communicating with external API";

    return res.status(status).json({
      status: "error",
      message: `OpenWeather API error: ${message}`,
    });
  }

  // ➤ Handle TypeORM/DB errors
  if (err.name === "QueryFailedError") {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      // detail: err.message,
    });
    // return res.status(400).json({
    //   status: "fail",
    //   message: "Database error",
    //   detail: err.message,
    // });
  }

  // ➤ Handle Errors with manual statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // ➤ Fallback 500
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
