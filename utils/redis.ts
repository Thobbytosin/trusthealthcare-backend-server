import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// for caching

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("REDIS DATABASE CONNECTED");

    return process.env.REDIS_URL;
  }
  throw new Error("REDIS CONNECTION FAILED");
};

export const redis = new Redis(redisClient());
