import { Request, Response, NextFunction } from "express";
import { WeatherService } from "./weather.service";
import { WeatherCreationInput } from "./weather.types";
import { ResponseBuilder } from "@utils/response-builder";
import { config } from "@root/config";
import { ApiError } from "@utils/api-error";

export class WeatherController {
  public static baseCacheKey = `${config.baseCacheKey}:weather`;
  public static invalidCache = `${config.baseCacheKey}:invalid:weather`;
  private service = new WeatherService();

  private createInvalidCacheKey(body: WeatherCreationInput) {
    return `${WeatherController.invalidCache}:${body.cityName},${body.country}`;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    if (await req.redis.get(this.createInvalidCacheKey(req.body))) {
      throw new ApiError("Invalid City And Country", 404);
    }

    try {
      const created = await this.service.createOrReuse({
        ...req.body,
        createdBy: req.user, // must be the user entity or id
      });

      req.invalidate_cache = true;

      res
        .status(201)
        .json(
          ResponseBuilder.success("Weather entry retrieved or created", created)
        );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        req.redis.set(this.createInvalidCacheKey(req.body), true, 86400);
      }

      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getAllPaginated(page, limit);
      res.json(
        ResponseBuilder.success("Paginated weather list retrieved", result)
      );
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.service.getById(id);
      if (!item) {
        return res
          .status(404)
          .json(ResponseBuilder.notFound("Weather not found"));
      }
      res.json(ResponseBuilder.success("Weather entry found", item));
    } catch (err) {
      next(err);
    }
  };

  getLatestByCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cityName } = req.params;
      const latest = await this.service.getLatestByCity(cityName);

      if (latest?.meta.updated) req.invalidate_cache = true;

      if (!latest) {
        return new ApiError("No weather data found for city", 404);
      }
      res.json(ResponseBuilder.success("Latest weather retrieved", latest));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.softDelete(id);
      if (!result) {
        return new ApiError("Weather record not found", 404);
      }
      req.invalidate_cache = true;

      res.json(ResponseBuilder.success("Weather record deleted"));
    } catch (err) {
      next(err);
    }
  };

  patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await this.service.update(id, req.body);

      if (!updated) {
        throw new ApiError("Weather record not found", 404);
      }

      req.invalidate_cache = true;

      res.json(ResponseBuilder.success("Weather record updated", updated));
    } catch (err) {
      next(err);
    }
  };
}
