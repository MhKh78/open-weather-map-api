import { Router, Request } from "express";
import { WeatherController } from "../modules/weather/weather.controller";
import { validateDto } from "@middlewares/validate-dto.middleware";
import { jwtGuard } from "@modules/auth/auth.guard";
import { CreateWeatherDto } from "@modules/weather/dto/create-weather.dto";
import { getWeatherByIdDto } from "@modules/weather/dto/get-weather.dto";
import { cacheRequest } from "@middlewares/cache.middleware";
import { UpdateWeatherDto } from "@modules/weather/dto/update-weather.dto";
import { invalidateCacheMiddleware } from "@middlewares/invalidate-cache.middleware";

/**
 * @swagger
 * tags:
 *   - name: Weather
 *     description: Weather forecast and storage endpoints
 */
const router = Router();
const controller = new WeatherController();
const baseCacheKey = WeatherController.baseCacheKey;

const cacheKey = (req: Request) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  return `${baseCacheKey}:page:${page}:limit:${limit}`;
};

router.use(invalidateCacheMiddleware(baseCacheKey));

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

/**
 * @swagger
 * /weather/latest/{cityName}:
 *   get:
 *     summary: Retrieve latest weather by city name
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: Latest weather data for the specified city
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/singleWeatherSuccess'
 *       404:
 *         description: No weather data found for city
 */
router.get("/latest/:cityName", controller.getLatestByCity);

/**
 * @swagger
 * /weather/{id}:
 *   patch:
 *     summary: Partially update a weather record
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateWeather'
 *     responses:
 *       200:
 *         description: Weather record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/singleWeatherSuccess'
 *       404:
 *         description: Weather record not found
 */
router.patch(
  "/:id",
  jwtGuard,
  validateDto(getWeatherByIdDto, "params"),
  validateDto(UpdateWeatherDto, "body"),
  controller.patch
);

/**
 * @swagger
 * /weather/{id}:
 *   delete:
 *     summary: Soft delete a weather record
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Weather record deleted
 *       404:
 *         description: Weather record not found
 */
router.delete(
  "/:id",
  validateDto(getWeatherByIdDto, "params"),
  jwtGuard,
  controller.delete
);

export default router;
