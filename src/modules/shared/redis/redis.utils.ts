import { RedisService } from "./redis.service";

async function invalidateCache(
  redis: RedisService,
  baseKey: string
): Promise<void> {
  if (!redis.isConnected()) return;

  const client = (redis as any).client; // access the internal RedisClientType
  const pattern = `${baseKey}:*`;

  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}
