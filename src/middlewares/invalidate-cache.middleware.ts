import { Request, Response, NextFunction } from "express";

// src/middlewares/invalidate-cache.middleware.ts

/**
 * Attaches a listener to invalidate Redis cache after the response is sent,
 * if `req.invalidate_cache` is set to a baseKey string.
 */
export const invalidateCacheMiddleware = (baseKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (req.invalidate_cache && req.redis.isConnected()) {
        try {
          await req.redis.deleteByPattern(baseKey);
          console.log(`🧹 Cache invalidated for pattern: ${baseKey}:*`);
        } catch (err) {
          console.warn("⚠️ Cache invalidation error:", err);
        }
      }
    });
    next();
  };
};
