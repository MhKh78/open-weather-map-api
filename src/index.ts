import * as express from "express";
import * as cors from "cors";
import AppDataSource from "@db/data-source";
import router from "./routes";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { globalErrorHandler } from "@middlewares/error.middleware";
import { config } from "@root/config";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("", router);

// Catch invalid routes
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

const PORT = config.port;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://${config.host}:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server initialization failed:", err);
    process.exit(1);
  }
}

bootstrap();
