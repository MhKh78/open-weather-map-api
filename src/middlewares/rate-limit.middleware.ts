import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 5 * 60_000, // 5 minutes
  max: 400, // Limit each IP to 400 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
