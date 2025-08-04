import { Request, Response, NextFunction } from "express";

export const cacheRequest = (
  keyGenerator: (req: Request) => string,
  ttl = 300
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.redis.isConnected()) return next();

    const key = keyGenerator(req);
    const cached = await req.redis.get(key);

    if (cached) {
      console.log("Serving From The Cache");

      return res.status(200).json(cached);
    }

    // Intercept res.json to capture and cache the response
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      req.redis.set(key, body, ttl).catch((err) => {
        console.error("Failed to cache response:", err);
      });
      return originalJson(body);
    };

    next();
  };
};
