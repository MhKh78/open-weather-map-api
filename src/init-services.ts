import { RedisService } from "@modules/shared/redis/redis.service";
import { config } from "./config";

// Create a single shared instance
export const redis = new RedisService(config.redis.url);
