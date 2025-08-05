import { createClient, RedisClientType } from "redis";

type RedisStatus = "disconnected" | "connecting" | "ready" | "error";

export class RedisService {
  private client: RedisClientType;
  private status: RedisStatus = "disconnected";

  constructor(private readonly url: string) {
    this.client = createClient({ url: this.url });

    this.client.on("connect", () => {
      this.status = "connecting";
      console.log("🔄 Redis connecting...");
    });

    this.client.on("ready", () => {
      this.status = "ready";
      console.log("✅ Redis ready");
    });

    this.client.on("error", (err) => {
      this.status = "error";
      console.error("❌ Redis error:", err);
    });

    this.client.on("end", () => {
      this.status = "disconnected";
      console.warn("⚠️ Redis connection ended");
    });

    this.client.on("reconnecting", () => {
      this.status = "connecting";
      console.log("♻️ Redis attempting to reconnect...");
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
      this.status = "disconnected";
      console.log("🛑 Redis disconnected");
    }
  }

  isConnected(): boolean {
    return this.status === "ready";
  }

  getStatus(): RedisStatus {
    return this.status;
  }

  async flush(): Promise<boolean> {
    await this.client.flushAll();
    return true;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected()) throw new Error("Redis is not ready");
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T = any>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    if (!this.isConnected()) throw new Error("Redis is not ready");
    await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected()) throw new Error("Redis is not ready");
    await this.client.del(key);
  }

  async deleteByPattern(baseKey: string): Promise<void> {
    if (!this.isConnected()) return;

    const pattern = `${baseKey}:*`;
    let cursor = 0;
    const keysToDelete: string[] = [];

    do {
      const { cursor: nextCursor, keys } = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== 0);

    if (keysToDelete.length > 0) {
      const multi = this.client.multi();
      keysToDelete.forEach((key) => multi.del(key));
      await multi.exec();
      console.log(
        `🧹 Deleted ${keysToDelete.length} keys with pattern "${pattern}"`
      );
    } else {
      console.log(`ℹ️ No keys found with pattern "${pattern}"`);
    }
  }
}
