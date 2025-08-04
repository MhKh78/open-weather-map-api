// src/modules/weather/weather.routes.ts
import { Router, Request } from "express";
import { WeatherController } from "../modules/weather/weather.controller";
import { validateDto } from "@middlewares/validate-dto.middleware";
import { jwtGuard } from "@middlewares/auth.middleware";
import { CreateWeatherDto } from "@modules/weather/dto/create-weather.dto";
import { getWeatherByIdDto } from "@modules/weather/dto/get-weather.dto";
import { cacheRequest } from "@middlewares/cache.middleware";

/**
 * @swagger
 * tags:
 *   - name: Weather
 *     description: Weather forecast and storage endpoints
 */
const router = Router();
const controller = new WeatherController();
const cacheKey = (req: Request) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  return `weather:page:${page}:limit:${limit}`;
};

/**
 * @swagger
 * /weather:
 *   post:
 *     summary: Store weather data
 *     tags: [Weather]

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createWeather'
 *     responses:
 *       201:
 *         description: Weather entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/singleWeatherSuccess'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/",
  jwtGuard,
  validateDto(CreateWeatherDto, "body"),
  controller.create
);

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get paginated weather records
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of weather records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/listWeatherSuccess'
 */

router.get("/", cacheRequest(cacheKey, 600), controller.getAll);

/**
 * @swagger
 * /weather/{id}:
 *   get:
 *     summary: Get weather record by ID
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Weather record UUID
 *     responses:
 *       200:
 *         description: Weather record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/singleWeatherSuccess'
 *       404:
 *         description: Weather record not found
 */
router.get(
  "/:id",
  validateDto(getWeatherByIdDto, "params"),
  cacheRequest((req: Request) => `weather:id:${req.params.id}`, 300),
  controller.getById
);

export default router;
