import { Request, Response, NextFunction } from 'express';
/**
 * Extracts and verifies a Bearer token from the Authorization header or cookie.
 * Attaches the decoded payload to req.user.
 * Throws 401 if the token is missing or invalid.
 */
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * Restricts a route to specific account types.
 * Must be used after protect().
 *
 * @example router.post('/', protect, requireAccountType('organiser'), handler)
 */
export declare const requireAccountType: (...types: Array<"user" | "organiser">) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Soft protect — attaches user to req if a valid token is present,
 * but does NOT block the request if there is no token.
 * Use for public routes that benefit from knowing who's logged in.
 */
export declare const ifToken: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=auth.d.ts.map