import { Request, Response, NextFunction } from "express";
import { ForecastService } from "./forecast.service";
import { ResponseBuilder } from "@utils/response-builder";

export class ForecastController {
  public static baseCacheKey = "forecast";
  private service = new ForecastService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getAllPaginated(page, limit);
      res.json(
        ResponseBuilder.success("Paginated forecast list retrieved", result)
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
          .json(ResponseBuilder.notFound("Forecast not found"));
      }
      res.json(ResponseBuilder.success("Forecast entry found", item));
    } catch (err) {
      next(err);
    }
  };

  getForecast = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cityName = req.params.cityName;
      const forecasts = await this.service.getOrFetch(cityName);

      if (!forecasts) {
        return res
          .status(404)
          .json(ResponseBuilder.notFound("City or forecast not found"));
      }

      res.json(ResponseBuilder.success("Forecast retrieved", forecasts));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.softDelete(id);
      if (!result) {
        return res
          .status(404)
          .json(ResponseBuilder.notFound("Forecast record not found"));
      }
      res.json(ResponseBuilder.success("Forecast record deleted"));
    } catch (err) {
      next(err);
    }
  };

  patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await this.service.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json(ResponseBuilder.notFound("Forecast record not found"));
      }
      res.json(ResponseBuilder.success("Forecast record updated", updated));
    } catch (err) {
      next(err);
    }
  };
}
