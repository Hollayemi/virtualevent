import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './config/database';
import { env } from './config/env';
import {
    errorHandler,
    handle404,
    jsonParseErrorHandler,
    extendResponse,
    AppResponse,
} from './middleware/error';

// Routes
import userRoutes from './routes/user.routes';
import organiserRoutes from './routes/organiser.routes';
import eventRoutes from './routes/event.routes';
import connectionRoutes from './routes/connection.routes';
import registrationRoutes from './routes/registration.routes';
// M2

dotenv.config();

connectDB();

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────

app.use(helmet());

const limiter = rateLimit({
    windowMs: env.NODE_ENV === 'development' ? 60_000 : 15 * 60_000,
    max: env.NODE_ENV === 'development' ? 500 : 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    }),
);

// ─── Parsers ──────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(jsonParseErrorHandler);

// ─── Response helpers ─────────────────────────────────────────────────────────

app.use(extendResponse);

// ─── Logging ──────────────────────────────────────────────────────────────────

if (env.isDev()) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (req: Request, res: Response) => {
    (res as AppResponse).data(
        {
            status: 'OK',
            environment: env.NODE_ENV,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
        'Server is healthy',
    );
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organisers', organiserRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/registrations', registrationRoutes);
// M2


// ─── Error handling ───────────────────────────────────────────────────────────

app.use('*', handle404);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
    console.log(`
  ┌─────────────────────────────────────────┐
  │     Event Networking Platform           │
  │     Environment : ${env.NODE_ENV.padEnd(20)}│
  │     Port        : ${String(env.PORT).padEnd(20)}│
  └─────────────────────────────────────────┘
    `);
});

process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION — shutting down:', err.name, err.message);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION — shutting down:', err.name, err.message);
    process.exit(1);
});

export default app;
