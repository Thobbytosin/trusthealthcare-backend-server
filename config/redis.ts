import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// const redis = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
// });

let redis: Redis | null = null;
let isRedisConnected = false;

// Save options to reuse later
const redisOptions = {
  tls: {},
  lazyConnect: true,
  maxRetriesPerRequest: 0,
};

// Try to connect initially
const connectRedis = async () => {
  const client = new Redis(process.env.REDIS_URI || "", redisOptions);

  try {
    await client.connect();
    console.log("✅ Redis connected");
    isRedisConnected = true;
    redis = client;

    // If error occurs later
    client.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
      client.disconnect();
      redis = null;
      isRedisConnected = false;
    });
  } catch (err) {
    console.error("❌ Redis connection failed:", (err as Error).message);
    client.disconnect();
    redis = null;
    isRedisConnected = false;
  }
};

// Call once on start
(async () => {
  await connectRedis();
})();

// Periodic reconnect if Redis went down
setInterval(async () => {
  if (!isRedisConnected) {
    console.log("🔁 Trying to reconnect to Redis...");
    await connectRedis();
  }
}, 10_000); //

export const getRedis = () => redis;

export default redis;
