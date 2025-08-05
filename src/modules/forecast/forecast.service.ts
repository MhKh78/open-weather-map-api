import AppDataSource from "@db/data-source";
import { City } from "@db/entities/city.entity";
import { config } from "@root/config";
import { Between, IsNull } from "typeorm";
import { CityRepository } from "@db/repositories/city.repository";
import { Forecast } from "@db/entities/forecast.entity";
import { ForecastRepository } from "@db/repositories/forecast.repository";
import { OpenWeatherMapService } from "@modules/shared/open-weather-map/open-weather-map-api";
import { DateTime } from "luxon";

const fromDate = DateTime.now().toISODate(); // e.g., '2025-08-05'
const toDate = DateTime.now().plus({ days: 4 }).toISODate();

export class ForecastService {
  private cityRepo = CityRepository(AppDataSource);
  private forecastRepo = ForecastRepository(AppDataSource);
  private weatherAPI = new OpenWeatherMapService(config.openWeatherApiKey);

  async getAll(): Promise<Forecast[]> {
    return this.forecastRepo.find({
      where: { deletedAt: IsNull() },
      relations: ["city"],
    });
  }

  async getById(id: string): Promise<Forecast | null> {
    return this.forecastRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["city"],
    });
  }

  async getAllPaginated(page = 1, limit = 50) {
    const [data, total] = await this.forecastRepo.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ["city"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
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

  async getOrFetch(cityName: string): Promise<Forecast[] | null> {
    const city = await this.cityRepo.findOne({
      where: { cityName },
      relations: ["city"],
    });
    if (!city) return null;

    const fromDate = DateTime.now().toISODate();
    const toDate = DateTime.now().plus({ days: 4 }).toISODate();

    const existing = await this.forecastRepo.find({
      where: {
        city,
        forecastDate: Between(fromDate, toDate),
      },
      relations: ["city"],
    });

    if (existing.length >= 5) return existing;

    const forecastData = await this.weatherAPI.fetchForecast(
      city.cityName,
      city.country
    );

    const entities = this.forecastRepo.create(
      forecastData.map((f: any) => {
        return { ...f, city };
      })
    );

    await this.forecastRepo.upsert(entities, ["city", "forecastDate"]);

    // Re-fetch with correct fromDate/toDate
    return await this.forecastRepo.find({
      where: {
        city,
        forecastDate: Between(fromDate, toDate),
      },
      relations: ["city"],
    });
  }

  async update(
    id: string,
    updates: Partial<Forecast>
  ): Promise<Forecast | null> {
    await this.forecastRepo.update(id, updates);
    return await this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.forecastRepo.update(id, {
      deletedAt: new Date(),
    });
    return result.affected !== undefined && result.affected > 0;
  }
}
