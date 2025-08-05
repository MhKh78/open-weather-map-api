// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { City } from "@db/entities/city.entity";

export const CityRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(City);
};
