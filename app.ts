import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import ErrorMiddleware from "./middlewares/error";
import userRouter from "./routes/user.route";
import doctorRouter from "./routes/doctor.route";
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.route";
import analyticsRouter from "./routes/analytics.route";
import { checkCookieConsent } from "./middlewares/cookie-consent";
import suggestionRouter from "./routes/suggestion.route";

export const app = express();

dotenv.config();

// access to use parse data from server as json and also set a limit of data to be parsed
app.use(express.json({ limit: "50mb" }));

// allow cookie parsing from server to client
app.use(cookieParser());

// access to send form data from server
app.use(express.urlencoded({ extended: false }));

// cors
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// rateLimit middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

// ROUTES
app.use("/api/v1/auth", checkCookieConsent, authRouter);
app.use("/api/v1/user", checkCookieConsent, userRouter);
app.use("/api/v1/doctor", doctorRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/suggestion", suggestionRouter);

// test api
app.get("/test", async (req, res) => {
  res.send({ message: "API IS WORKING" });
});

// unknown route
app.all("*", (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as any;
  error.statusCode = 400;
  next(error);
});

// MIDDLEWARES

// limit requests to server per 15 minutes
app.use(limiter);

// handle errors middleware on all requests
app.use(ErrorMiddleware);
