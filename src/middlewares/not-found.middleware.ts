// src/middleware/not-found.middleware.ts
import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
}
