// For TypeORM v0.3+ (recommended)
import { DataSource } from "typeorm";
import { User } from "@db/entities/user.entity";

export const UserRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(User);
};
