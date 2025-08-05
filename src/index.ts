import * as express from "express";
import * as cors from "cors";
import AppDataSource from "@db/data-source";
import router from "./routes";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { globalErrorHandler } from "@middlewares/error.middleware";
import { config } from "@root/config";
import { redis } from "./init-services";
import { attachRedis } from "@middlewares/attach-redis.middleware";
import { apiRateLimiter } from "@middlewares/rate-limit.middleware";

const app = express();
app.use(cors());
app.use(express.json());
app.use(attachRedis);

app.use(apiRateLimiter);

// Routes
app.use("", router);

app.get("/health", (req, res) => {
  res.json({
    redis: req.redis.getStatus(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Catch invalid routes
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

const PORT = config.port;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    await redis.connect();
    await redis.flush();
    console.log("✅ Redis connection Check Successfull");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://${config.host}:${PORT}`);
      console.log(`🚀 Check Docs on http://${config.host}:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Server initialization failed:", err);
    process.exit(1);
  }
}

bootstrap();
