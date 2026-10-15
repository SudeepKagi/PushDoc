import IORedis from "ioredis";

const REDIS_OPTIONS = { maxRetriesPerRequest: null };

function createRedisClient() {
  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, REDIS_OPTIONS);
  }
  return new IORedis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME || "default",
    ...REDIS_OPTIONS,
  });
}

// Analytics cache client
export const redis = createRedisClient();

// readme-generation + cleanup queues/workers
export const readmeConnection = createRedisClient();

// email-broadcast queue/worker
export const emailConnection = createRedisClient();
