import "reflect-metadata";
import { DataSource } from "typeorm";
import { Weather } from "./entities/weather.entity";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { config } from "@root/config";

dotenv.config();

export default new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  // synchronize: true,
  synchronize: false,
  logging: ["query", "error"],
  entities: [Weather, User],
  migrations: [__dirname + "/migrations/*.ts"], // <-- key line
  subscribers: [],

  extra: {
    // Specifying Pool Size
    // poolSize: 50,
    max: 50,
  },

  // dropSchema: true,
});
