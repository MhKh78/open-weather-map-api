import { redis } from "@root/init-services";
import { Request, Response, NextFunction } from "express";

export const attachRedis = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!redis.isConnected()) {
    return next(new Error("Redis not connected"));
  }

  req.redis = redis;
  next();
};
