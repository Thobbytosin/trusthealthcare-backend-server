"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCachedMetaTags = exports.getCachedMetaTags = exports.setCachedSlots = exports.getCachedSlots = exports.setCachedDoctor = exports.getCachedDoctor = exports.setCachedDoctors = exports.getCachedDoctors = exports.setCachedUser = exports.getCachedUser = void 0;
const redis_1 = require("../config/redis");
const getCachedUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return null;
    }
    try {
        const cached = yield redisClient.get(`user:${userId}`);
        return cached ? JSON.parse(cached) : null;
    }
    catch (err) {
        return null;
    }
});
exports.getCachedUser = getCachedUser;
const setCachedUser = (userId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return;
    }
    try {
        yield redisClient.set(`user:${userId}`, JSON.stringify(userData), "EX", 7 * 24 * 60 * 60 // cache expires in 7 days
        );
    }
    catch (err) {
        console.error("❌ Redis set failed:", err);
    }
});
exports.setCachedUser = setCachedUser;
const getCachedDoctors = () => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return null;
    }
    try {
        const cached = yield redisClient.get("doctors:list:unauthenticated");
        return cached ? JSON.parse(cached) : null;
    }
    catch (err) {
        return null;
    }
});
exports.getCachedDoctors = getCachedDoctors;
const setCachedDoctors = (doctors) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return;
    }
    try {
        yield redisClient.set("doctors:list:unauthenticated", JSON.stringify(doctors), "EX", 7 * 24 * 60 * 60 // cache expires in 7 days
        );
    }
    catch (err) {
        console.error("❌ Redis set failed:", err);
    }
});
exports.setCachedDoctors = setCachedDoctors;
const getCachedDoctor = (doctorId) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return null;
    }
    try {
        const cached = yield redisClient.get(`doctor:${doctorId}`);
        return cached ? JSON.parse(cached) : null;
    }
    catch (err) {
        return null;
    }
});
exports.getCachedDoctor = getCachedDoctor;
const setCachedDoctor = (doctorId, doctorData) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return;
    }
    try {
        yield redisClient.set(`doctor:${doctorId}`, JSON.stringify(doctorData), "EX", 7 * 24 * 60 * 60 // cache expires in 7 days
        );
    }
    catch (err) {
        console.error("❌ Redis set failed:", err);
    }
});
exports.setCachedDoctor = setCachedDoctor;
const getCachedSlots = (doctorId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return null;
    }
    try {
        const cached = yield redisClient.get(`slots:doctor:${doctorId}:date:${date}`);
        return cached ? JSON.parse(cached) : null;
    }
    catch (err) {
        return null;
    }
});
exports.getCachedSlots = getCachedSlots;
const setCachedSlots = (doctorId, doctorSlotData, date) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return;
    }
    try {
        yield redisClient.set(`slots:doctor:${doctorId}:date:${date}`, JSON.stringify(doctorSlotData), "EX", 7 * 24 * 60 * 60 // cache expires in 7 days
        );
    }
    catch (err) {
        console.error("❌ Redis set failed:", err);
    }
});
exports.setCachedSlots = setCachedSlots;
const getCachedMetaTags = (doctorId) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return null;
    }
    try {
        const cached = yield redisClient.get(`meta-tags:doctor:${doctorId}`);
        return cached ? JSON.parse(cached) : null;
    }
    catch (err) {
        return null;
    }
});
exports.getCachedMetaTags = getCachedMetaTags;
const setCachedMetaTags = (doctorId, tags) => __awaiter(void 0, void 0, void 0, function* () {
    const redisClient = (0, redis_1.getRedis)();
    if (!redisClient) {
        return;
    }
    try {
        yield redisClient.set(`meta-tags:doctor:${doctorId}`, JSON.stringify(tags), "EX", 7 * 24 * 60 * 60 // cache expires in 7 days
        );
    }
    catch (err) {
        console.error("❌ Redis set failed:", err);
    }
});
exports.setCachedMetaTags = setCachedMetaTags;
