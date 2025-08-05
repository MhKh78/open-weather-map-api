// src/config/env.config.ts
import * as dotenv from "dotenv";
import * as Joi from "joi";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  HOST: Joi.string().default("localhost"),
  PORT: Joi.number().default(8010),

  // Postgres Setup
  PGHOST: Joi.string().required(),
  PGPORT: Joi.number().default(5432),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGDATABASE: Joi.string().required(),

  // Redis Setup
  REDIS_URL: Joi.string().required(),

  OPEN_WEATHER_MAP_API_KEY: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
}).unknown(true); // allow extra vars like PATH, etc.

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  throw new Error(`❌ Environment validation error: ${error.message}`);
}

export const config = {
  rootDir: __dirname,
  baseCacheKey: "openweather",
  host: envVars.HOST,
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,

  db: {
    host: envVars.PGHOST,
    port: envVars.PGPORT,
    user: envVars.PGUSER,
    password: envVars.PGPASSWORD,
    database: envVars.PGDATABASE,
  },

  redis: {
    url: process.env.REDIS_URL!,
  },
  jwtSecret: envVars.JWT_SECRET,
  openWeatherApiKey: envVars.OPEN_WEATHER_MAP_API_KEY,
};
