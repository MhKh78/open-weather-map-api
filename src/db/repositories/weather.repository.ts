// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { Weather } from "../entities/weather.entity";
import { City } from "@db/entities/city.entity";

export const WeatherRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Weather).extend({
    async findFreshByCity(city: City, maxAgeMinutes = 15) {
      const weather = await this.findOne({
        where: { city },
        order: { fetchedAt: "DESC" },
      });

      if (!weather) return null;

      const now = new Date();
      const isFresh =
        now.getTime() - weather.fetchedAt.getTime() < maxAgeMinutes * 60 * 1000;

      return isFresh ? weather : null;
    },
  });
};
