import { User } from "@db/entities/user.entity";
import { RedisService } from "@modules/shared/redis/redis.service";
import { Request } from "express";
import { RedisClientType, RediSearchSchema } from "redis"; // Or whatever type your redis client has

// Augment the existing 'Request' interface
declare global {
  namespace Express {
    export interface Request {
      redis: RedisService;
      user?: User;
      invalidate_cache?: boolean;
    }
  }
}
