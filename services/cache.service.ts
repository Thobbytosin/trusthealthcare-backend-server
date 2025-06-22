import { User } from "../models/user.model";
import { getRedis } from "../config/redis";
import { Doctor } from "../models/doctor.model";

export const getCachedUser = async (userId: string) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedUser = async (
  userId: string,
  userData: Partial<User>
) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      `user:${userId}`,
      JSON.stringify(userData),
      "EX",
      7 * 24 * 60 * 60 // cache expires in 7 days
    );
  } catch (err) {
    console.error("❌ Redis set failed:", err);
  }
};

export const getCachedDoctors = async () => {
  const redisClient = getRedis();
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get("doctors:list:unauthenticated");
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedDoctors = async (doctors: Partial<Doctor[]>) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      "doctors:list:unauthenticated",
      JSON.stringify(doctors),
      "EX",
      7 * 24 * 60 * 60 // cache expires in 7 days
    );
  } catch (err) {
    console.error("❌ Redis set failed:", err);
  }
};

export const getCachedDoctor = async (doctorId: string) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get(`doctor:${doctorId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedDoctor = async (
  doctorId: string,
  doctorData: Partial<Doctor>
) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      `doctor:${doctorId}`,
      JSON.stringify(doctorData),
      "EX",
      7 * 24 * 60 * 60 // cache expires in 7 days
    );
  } catch (err) {
    console.error("❌ Redis set failed:", err);
  }
};

export const getCachedSlots = async (doctorId: string, date: string) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get(
      `slots:doctor:${doctorId}:date:${date}`
    );
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedSlots = async (
  doctorId: string,
  doctorSlotData: any,
  date: string
) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      `slots:doctor:${doctorId}:date:${date}`,
      JSON.stringify(doctorSlotData),
      "EX",
      7 * 24 * 60 * 60 // cache expires in 7 days
    );
  } catch (err) {
    console.error("❌ Redis set failed:", err);
  }
};

export const getCachedMetaTags = async (doctorId: string) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get(`meta-tags:doctor:${doctorId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedMetaTags = async (
  doctorId: string,
  tags: { name: string; specialty: string }
) => {
  const redisClient = getRedis();
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      `meta-tags:doctor:${doctorId}`,
      JSON.stringify(tags),
      "EX",
      7 * 24 * 60 * 60 // cache expires in 7 days
    );
  } catch (err) {
    console.error("❌ Redis set failed:", err);
  }
};
