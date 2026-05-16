import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError, asyncHandler, AppResponse } from './error';

/**
 * Extracts and verifies a Bearer token from the Authorization header or cookie.
 * Attaches the decoded payload to req.user.
 * Throws 401 if the token is missing or invalid.
 */
export const protect = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new AppError('Not authorized to access this route', 401, 'UNAUTHORIZED'));
        }

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            return next();
        } catch {
            return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
        }
    },
);

/**
 * Restricts a route to specific account types.
 * Must be used after protect().
 *
 * @example router.post('/', protect, requireAccountType('organiser'), handler)
 */
export const requireAccountType = (...types: Array<'user' | 'organiser'>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(new AppError('Not authenticated', 401, 'UNAUTHORIZED'));
            return;
        }

        if (!types.includes(req.user.accountType)) {
            next(
                new AppError(
                    `This route is restricted to: ${types.join(', ')}`,
                    403,
                    'FORBIDDEN',
                ),
            );
            return;
        }

        next();
    };
};

/**
 * Soft protect — attaches user to req if a valid token is present,
 * but does NOT block the request if there is no token.
 * Use for public routes that benefit from knowing who's logged in.
 */
export const ifToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) return next();

        try {
            req.user = verifyToken(token);
        } catch {
            // silently ignore bad tokens on soft-protect routes
        }

        next();
    },
);
