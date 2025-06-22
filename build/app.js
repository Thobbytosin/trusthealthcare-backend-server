"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const error_1 = __importDefault(require("./middlewares/error"));
const cookie_consent_1 = require("./middlewares/cookie-consent");
const auth_route_1 = __importDefault(require("./routes/v1/auth.route"));
const user_route_1 = __importDefault(require("./routes/v1/user.route"));
const doctor_route_1 = __importDefault(require("./routes/v1/doctor.route"));
const admin_route_1 = __importDefault(require("./routes/v1/admin.route"));
const analytics_route_1 = __importDefault(require("./routes/v1/analytics.route"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument_1 = __importDefault(require("./docs/swaggerDocument"));
const apiKey_route_1 = __importDefault(require("./routes/v1/apiKey.route"));
const apiKey_auth_1 = require("./middlewares/apiKey-auth");
const user_auth_1 = require("./middlewares/user-auth");
const dbStatus_1 = require("./utils/dbStatus");
exports.app = (0, express_1.default)();
dotenv_1.default.config();
// access to use parse data from server as json and also set a limit of data to be parsed
exports.app.use(express_1.default.json({ limit: "50mb" }));
// allow cookie parsing from server to client
exports.app.use((0, cookie_parser_1.default)());
// access to send form data from server
exports.app.use(express_1.default.urlencoded({ extended: false }));
const allowedOrigins = [
    process.env.NODE_ENV === "development" && "http://localhost:3000",
    "https://trust-healthcare-client.vercel.app",
].filter(Boolean);
//CORS - cross-origin resource sharing
exports.app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
}));
// Health check route above the middlewares
exports.app.get("/api/v1/health", (_, res) => {
    // const dbConnected = false;
    const dbConnected = (0, dbStatus_1.getDatabaseStatus)();
    if (dbConnected) {
        console.log("✅✅ DB UP AND RUNNING ✅✅");
        return res.status(200).json({ status: "ok", database: "connected" });
    }
    else {
        console.log("❌❌ DB DOWN");
        return res.status(503).json({ status: "error", database: "disconnected" });
    }
});
// request for api key
exports.app.use("/api/v1/apiKey", apiKey_route_1.default);
// rateLimit middleware
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
// GENERIC - MIDDLEWARES
// limit requests to server per 15 minutes
exports.app.use(limiter);
// check consent on all routes
exports.app.use(cookie_consent_1.checkCookieConsent);
// API DOCUMENTATION
exports.app.use("/api/v1/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument_1.default, {
    swaggerOptions: {
        requestInterceptor: (req) => {
            req.credentials = "include";
            return req;
        },
    },
}));
// ROUTES
// VERSION 1.0
exports.app.use("/api/v1/auth", auth_route_1.default);
exports.app.use("/api/v1/user", user_route_1.default);
exports.app.use("/api/v1/doctor", doctor_route_1.default);
exports.app.use("/api/v1/admin", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, admin_route_1.default);
exports.app.use("/api/v1/analytics", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, analytics_route_1.default);
// unknown route
exports.app.all("*", (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 400;
    next(error);
});
// ERROR MIDDLEWARE
exports.app.use(error_1.default);
