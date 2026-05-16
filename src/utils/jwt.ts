import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
    id: string;
    accountType: 'user' | 'organiser';
}

export const signToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRE as any,
    });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const attachCookie = (res: any, token: string): void => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env.isProd(),
        sameSite: env.isProd() ? 'strict' : 'lax',
        maxAge: env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });
};
