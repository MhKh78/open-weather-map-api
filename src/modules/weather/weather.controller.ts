import { Request, Response, NextFunction } from "express";
import { WeatherService } from "./weather.service";
import { WeatherCreationInput } from "./weather.types";
import { ResponseBuilder } from "@utils/response-builder";

export class WeatherController {
  private service = new WeatherService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exists = await this.service.getByCityAndCountry(req.body);
      if (exists) {
        res
          .status(201)
          .json(ResponseBuilder.success("Weather entry found", exists));
      } else {
        const created = await this.service.create({
          ...req.body,
          createdBy: req.user,
        });
        res
          .status(201)
          .json(ResponseBuilder.created("Weather entry created", created));
      }
    } catch (err) {
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
}
