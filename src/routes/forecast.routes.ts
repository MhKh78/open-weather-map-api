import { cacheRequest } from "@middlewares/cache.middleware";
import { invalidateCacheMiddleware } from "@middlewares/invalidate-cache.middleware";
import { validateDto } from "@middlewares/validate-dto.middleware";
import { getForecastByIdDto } from "@modules/forecast/dto/get-forecast.dto";
import { getForecastByCityDto } from "@modules/forecast/dto/get-weather-city.dto";
import { ForecastController } from "@modules/forecast/forecast.controller";
import { getWeatherByCityDto } from "@modules/weather/dto/get-weather-city.dto";
import { Router, Request } from "express";

const router = Router();
const controller = new ForecastController();
const baseCacheKey = ForecastController.baseCacheKey;

const cacheKey = (req: Request) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  return `${baseCacheKey}:page:${page}:limit:${limit}`;
};

router.use(invalidateCacheMiddleware(baseCacheKey));

/**
 * @swagger
 * /forecast/5day/{cityName}:
 *   get:
 *     summary: Get 5-day forecast for a city
 *     tags: [Forecast]
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: List of forecast records
 *       404:
 *         description: Not found
 */
router.get(
  "/5day/:cityName",
  validateDto(getForecastByCityDto, "params"),
  cacheRequest(
    (req: Request) => `${baseCacheKey}:city:${req.params.cityName}`,
    300
  ),
  controller.getForecast
);

/**
 * @swagger
 * /forecast:
 *   get:
 *     summary: Get paginated list of forecasts
 *     tags: [Forecast]
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
 *         description: Paginated forecast list retrieved
 */
router.get("/", cacheRequest(cacheKey, 600), controller.getAll);

/**
 * @swagger
 * /forecast/{id}:
 *   get:
 *     summary: Get forecast record by ID
 *     tags: [Forecast]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Forecast record UUID
 *     responses:
 *       200:
 *         description: Forecast record found
 *       404:
 *         description: Forecast not found
 */
router.get(
  "/:id",
  validateDto(getForecastByIdDto, "params"),
  cacheRequest((req: Request) => `${baseCacheKey}:id:${req.params.id}`, 300),
  controller.getById
);

export default router;
