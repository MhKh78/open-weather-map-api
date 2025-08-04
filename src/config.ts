// src/config/env.config.ts
import * as dotenv from "dotenv";
import * as Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  HOST: Joi.string().default("localhost"),
  PORT: Joi.number().default(8010),
  PGHOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGDATABASE: Joi.string().required(),
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
  host: envVars.HOST,
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,

  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASS,
    database: envVars.DB_NAME,
  },

  redis: {
    url: process.env.REDIS_URL!,
  },
  jwtSecret: envVars.JWT_SECRET,
  openWeatherApiKey: envVars.OPEN_WEATHER_MAP_API_KEY,
};
