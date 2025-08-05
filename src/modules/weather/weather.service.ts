import AppDataSource from "@db/data-source";
import { City } from "@db/entities/city.entity";
import { Weather } from "@db/entities/weather.entity";
import { WeatherCreationInput } from "./weather.types";
import { OpenWeatherMapService } from "@modules/shared/open-weather-map/open-weather-map-api";
import { config } from "@root/config";
import { WeatherRepository } from "@db/repositories/weather.repository";
import { CityRepository } from "@db/repositories/city.repository";
import { IsNull } from "typeorm";
import { ApiError } from "@utils/api-error";

export class WeatherService {
  private FETCH_FRESHNESS_MINUTES = 15;

  private cityRepo = CityRepository(AppDataSource);
  private weatherRepo = WeatherRepository(AppDataSource);
  private weatherAPI = new OpenWeatherMapService(config.openWeatherApiKey);

  async createOrReuse(input: WeatherCreationInput): Promise<Weather> {
    const city = await this.ensureCity(input.cityName, input.country);
    if (!city) throw new Error("City could not be created");

    const latest = await this.weatherRepo.findOne({
      where: { city },
      order: { fetchedAt: "DESC" },
      relations: ["city"],
    });

    const now = new Date();
    const isFresh =
      latest &&
      now.getTime() - latest.fetchedAt.getTime() <
        this.FETCH_FRESHNESS_MINUTES * 60_000;

    if (isFresh) return latest;

    const freshData = await this.weatherAPI.fetchWeather(
      city.cityName,
      city.country
    );
    const newWeather = this.weatherRepo.create({
      ...freshData,
      fetchedAt: new Date(),
      city,
    });

    return await this.weatherRepo.save(newWeather);
  }

  async getLatestByCity(
    cityName: string
  ): Promise<{ data: Weather; meta: { updated: boolean } } | null> {
    const city = await this.ensureCity(cityName);
    if (!city) return null;

    const latest = await this.weatherRepo.findOne({
      where: { city },
      order: { fetchedAt: "DESC" },
      relations: ["city"],
    });

    const now = new Date();
    const isFresh =
      latest &&
      now.getTime() - latest.fetchedAt.getTime() <
        this.FETCH_FRESHNESS_MINUTES * 60_000;

    if (isFresh) return { data: latest, meta: { updated: false } };

    try {
      const fresh = await this.weatherAPI.fetchWeather(
        city.cityName,
        city.country
      );
      const newWeather = this.weatherRepo.create({
        ...fresh,
        fetchedAt: new Date(),
        city,
      });
      const saved = await this.weatherRepo.save(newWeather);
      return { data: saved, meta: { updated: true } };
    } catch {
      if (latest) return { data: latest, meta: { updated: false } };
      return null;
    }
  }

  async getAll(): Promise<Weather[]> {
    return this.weatherRepo.find({
      where: { deletedAt: IsNull() },
      relations: ["city"],
    });
  }

  async getById(id: string): Promise<Weather | null> {
    return this.weatherRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["city"],
    });
  }

  async getAllPaginated(page = 1, limit = 50) {
    const [data, total] = await this.weatherRepo.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ["city"],
      skip: (page - 1) * limit,
      take: limit,
      order: { fetchedAt: "DESC" },
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

  async update(id: string, updates: Partial<Weather>): Promise<Weather | null> {
    await this.weatherRepo.update({ id, deletedAt: IsNull() }, updates);
    return await this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.weatherRepo.update(id, { deletedAt: new Date() });
    return result.affected !== undefined && result.affected > 0;
  }

  // 🔒 Private: DRY City Resolver
  private async ensureCity(
    cityName: string,
    country?: string
  ): Promise<City | null> {
    let city = await this.cityRepo.findOne({
      where: { cityName, country },
      relations: ["weatherRecords"],
    });

    if (city) return city;

    try {
      if (country) {
        const geo = await this.weatherAPI.fetchCity(cityName, country);
        city = this.cityRepo.create({
          cityName: geo.cityName,
          country: geo.country,
          lat: geo.lat,
          lon: geo.lon,
        });
        return await this.cityRepo.save(city);
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        return null;
      }
    }
  }
}
