// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { Weather } from "../entities/weather.entity";
import { City } from "@db/entities/city.entity";

export const WeatherRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Weather);
};
