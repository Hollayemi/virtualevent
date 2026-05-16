"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_1 = __importDefault(require("./config/database"));
const env_1 = require("./config/env");
const swagger_1 = require("./config/swagger");
const error_1 = require("./middleware/error");
// Routes
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const organiser_routes_1 = __importDefault(require("./routes/organiser.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const connection_routes_1 = __importDefault(require("./routes/connection.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
dotenv_1.default.config();
(0, database_1.default)();
const app = (0, express_1.default)();
//  Security 
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.NODE_ENV === 'development' ? 60000 : 15 * 60000,
    max: env_1.env.NODE_ENV === 'development' ? 500 : 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
//  CORS 
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// app.use(jsonParseErrorHandler);
//  Response helpers 
app.use(error_1.extendResponse);
//  Logging 
if (env_1.env.isDev()) {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Available at: GET /api/docs
// Raw spec at:  GET /api/docs.json
app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customSiteTitle: 'GYNSIS API Docs',
    swaggerOptions: {
        persistAuthorization: true, // keeps the JWT filled in across page refreshes
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
    },
}));
//  Health 
app.get('/health', (req, res) => {
    res.data({
        status: 'OK',
        environment: env_1.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }, 'Server is healthy');
});
//  API Routes 
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/organisers', organiser_routes_1.default);
app.use('/api/v1/events', event_routes_1.default);
app.use('/api/v1/connections', connection_routes_1.default);
app.use('/api/v1/registrations', registration_routes_1.default);
//  Error handling 
app.use('*', error_1.handle404);
app.use(error_1.errorHandler);
//  Start 
const server = app.listen(env_1.env.PORT, () => {
    console.log(`
  ┌┐
  │     Event Networking Platform           │
  │     Environment : ${env_1.env.NODE_ENV.padEnd(20)}│
  │     Port        : ${String(env_1.env.PORT).padEnd(20)}│
  └┘
    `);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION — shutting down:', err.name, err.message);
    server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION — shutting down:', err.name, err.message);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map