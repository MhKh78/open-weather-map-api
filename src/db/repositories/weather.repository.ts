// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { Weather } from "../entities/weather.entity";

export const WeatherRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Weather).extend({
    // Add custom methods here
    async findByCity(city: string) {
      return this.find({ where: { cityName: city } });
    },
  });
};
