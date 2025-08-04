// src/modules/weather/weather.service.ts
import AppDataSource from "@db/data-source";
import { Weather } from "@db/entities/weather.entity";
import { WeatherInput } from "./weather.types";
import { OpenWeatherMapService } from "@modules/shared/open-weather-map/open-weather-map-api";
import { config } from "@root/config";

export class WeatherService {
  private weatherAPI = new OpenWeatherMapService(config.openWeatherApiKey); // API key loaded via env
  private repo = AppDataSource.getRepository(Weather);

  async create(data: WeatherInput): Promise<Weather> {
    const weather = await this.weatherAPI.fetchByCity(
      data.city_name,
      data.country
    );

    const entity = this.repo.create({ ...data, ...weather });
    return await this.repo.save(entity);
  }

  async getAll(): Promise<Weather[]> {
    return await this.repo.find();
  }

  async getById(id: string): Promise<Weather | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async getAllPaginated(page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { fetchedAt: "DESC" }, // optional
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
