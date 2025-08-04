// src/middleware/validate-dto.middleware.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Validates request data (body, params, or query) against a class-validator DTO.
 * @param dto The class or schema to validate against
 * @param source One of: 'body', 'params', or 'query'
 */
export function validateDto(
  dto: any,
  source: "body" | "params" | "query" = "body"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const value = req[source];
    const object = plainToInstance(dto, value);

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return next(errors); // Let globalErrorHandler handle it
    }

    // Replace the request section with validated instance
    req[source] = object;
    next();
  };
}
