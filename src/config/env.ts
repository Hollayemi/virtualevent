import dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] || fallback;
    if (value === undefined) {
        throw new Error(`Environment variable "${key}" is required but not set.`);
    }
    return value;
};

export const env = {
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    PORT: parseInt(getEnv('PORT', '5000'), 10),
    MONGODB_URI: getEnv('MONGODB_URI', ''),
    MONGODB_URI_PROD: getEnv('MONGODB_URI_PROD', ''),
    JWT_SECRET: getEnv('JWT_SECRET', 'fallback-secret-prod'),
    JWT_EXPIRE: getEnv('JWT_EXPIRE', '7d'),
    JWT_COOKIE_EXPIRE: parseInt(getEnv('JWT_COOKIE_EXPIRE', '7'), 10),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'fallback-refresh-secret'),
    JWT_REFRESH_EXPIRE: getEnv('JWT_REFRESH_EXPIRE', '30d'),
    CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:3000'),
    isDev: () => process.env.NODE_ENV === 'development',
    isProd: () => process.env.NODE_ENV === 'production',
};
