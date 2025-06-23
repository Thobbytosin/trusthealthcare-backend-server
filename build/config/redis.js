"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbStatus_1 = require("../utils/dbStatus");
dotenv_1.default.config();
// const redis = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
// });
let redis = null;
let isRedisConnected = false;
// Save options to reuse later
const redisOptions = {
  tls: {},
  lazyConnect: true,
  maxRetriesPerRequest: 0,
};
// Try to connect initially
const connectRedis = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = new ioredis_1.default(
      process.env.REDIS_URI || "",
      redisOptions
    );
    try {
      yield client.connect();
      console.log("✅ Redis connected");
      isRedisConnected = true;
      redis = client;
      // If error occurs later
      client.on("error", (err) => {
        console.error("❌ Redis error:", err.message);
        client.disconnect();
        redis = null;
        isRedisConnected = false;
        (0, dbStatus_1.setRedisConnected)(false);
      });
    } catch (err) {
      console.error("❌ Redis connection failed:", err.message);
      client.disconnect();
      redis = null;
      (0, dbStatus_1.setRedisConnected)(false);
      isRedisConnected = false;
    }
  });
// Call once on start
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield connectRedis();
  }))();
// Periodic reconnect if Redis went down
setInterval(
  () =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (!isRedisConnected) {
        console.log("🔁 Trying to reconnect to Redis...");
        yield connectRedis();
      }
    }),
  10000
); //
const getRedis = () => redis;
exports.getRedis = getRedis;
exports.default = redis;
