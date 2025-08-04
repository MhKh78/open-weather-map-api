// src/routes/index.ts
import { Router } from "express";
import weatherRoutes from "@root/routes/weather.routes";
import * as swaggerUi from "swagger-ui-express";
import swaggerSpec from "@utils/swagger-config";

const router = Router();

router.use("/weather", weatherRoutes);
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerSpec));

export default router;
