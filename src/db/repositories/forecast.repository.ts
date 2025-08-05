// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { Forecast } from "../entities/forecast.entity";

export const ForecastRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Forecast);
};
