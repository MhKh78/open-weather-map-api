// src/middlewares/auth.middleware.ts
import { config } from "@root/config";
import { ApiError } from "@utils/api-error";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import AppDataSource from "@db/data-source";
import { User } from "@db/entities/user.entity";

export async function jwtGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userRepo = AppDataSource.getRepository(User);
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    (req as any).user = user; // Attach full user
    next();
  } catch {
    throw new ApiError("Invalid or expired token", 401);
  }
}
