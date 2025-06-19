import Redis from "ioredis";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config();

// const redis = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
// });

const redis = new Redis(process.env.REDIS_URI || "", {
  tls: {}, // required for Upstash
});

redis.on("connect", () => {
  console.log("✅✅ REDIS CONNECTED");
});

redis.on("error", (err) => {
  console.error("❌ REDIS ERROR CONNECTING:", err);
});
export default redis;
