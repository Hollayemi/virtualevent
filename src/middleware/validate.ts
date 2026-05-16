import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppResponse } from './error';

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = (result.error as ZodError).errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));

            res.status(422).json({
                success: false,
                type: 'validation_error',
                message: 'Validation failed',
                errors,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        req.body = result.data;
        next();
    };
