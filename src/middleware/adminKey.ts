import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

/**
 * Simple API-key guard for admin-only routes.
 * Full admin auth with roles is deferred to a later milestone.
 *
 * Usage: router.post('/', adminKey, handler)
 *
 * Client must send: x-admin-key: <ADMIN_SECRET_KEY>
 */
export const adminKey = (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers['x-admin-key'];
    const secret = process.env.ADMIN_SECRET_KEY;

    if (!secret) {
        // Server misconfiguration — fail loudly in dev, silently block in prod
        if (process.env.NODE_ENV === 'development') {
            return next(new AppError('ADMIN_SECRET_KEY is not set in environment', 500));
        }
        return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
    }

    if (!key || key !== secret) {
        return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
    }

    next();
};
