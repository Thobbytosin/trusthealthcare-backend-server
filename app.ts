import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import ErrorMiddleware from "./middlewares/error";
import { checkCookieConsent } from "./middlewares/cookie-consent";
import authRouterV1 from "./routes/v1/auth.route";
import userRouterV1 from "./routes/v1/user.route";
import doctorRouterV1 from "./routes/v1/doctor.route";
import adminRouterV1 from "./routes/v1/admin.route";
import analyticsRouterV1 from "./routes/v1/analytics.route";
import suggestionRouterV1 from "./routes/v1/suggestion.route";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swaggerDocument";

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

// Health check route above the middlewares
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// rateLimit middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// GENERIC - MIDDLEWARES
// limit requests to server per 15 minutes
app.use(limiter);

// check consent on all routes
app.use(checkCookieConsent);

// API DOCUMENTATION
app.use(
  "/api/v1/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      requestInterceptor: (req: any) => {
        req.credentials = "include";
        return req;
      },
    },
  })
);

// ROUTES
// VERSION 1.0
app.use("/api/v1/auth", authRouterV1);
app.use("/api/v1/user", userRouterV1);
app.use("/api/v1/doctor", doctorRouterV1);
app.use("/api/v1/admin", adminRouterV1);
app.use("/api/v1/analytics", analyticsRouterV1);
app.use("/api/v1/suggestion", suggestionRouterV1);

// unknown route
app.all("*", (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as any;
  error.statusCode = 400;
  next(error);
});

// ERROR MIDDLEWARE
app.use(ErrorMiddleware);
