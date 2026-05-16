"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ifToken = exports.requireAccountType = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const error_1 = require("./error");
/**
 * Extracts and verifies a Bearer token from the Authorization header or cookie.
 * Attaches the decoded payload to req.user.
 * Throws 401 if the token is missing or invalid.
 */
exports.protect = (0, error_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new error_1.AppError('Not authorized to access this route', 401, 'UNAUTHORIZED'));
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        return next();
    }
    catch {
        return next(new error_1.AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
});
/**
 * Restricts a route to specific account types.
 * Must be used after protect().
 *
 * @example router.post('/', protect, requireAccountType('organiser'), handler)
 */
const requireAccountType = (...types) => {
    return (req, res, next) => {
        if (!req.user) {
            next(new error_1.AppError('Not authenticated', 401, 'UNAUTHORIZED'));
            return;
        }
        if (!types.includes(req.user.accountType)) {
            next(new error_1.AppError(`This route is restricted to: ${types.join(', ')}`, 403, 'FORBIDDEN'));
            return;
        }
        next();
    };
};
exports.requireAccountType = requireAccountType;
/**
 * Soft protect — attaches user to req if a valid token is present,
 * but does NOT block the request if there is no token.
 * Use for public routes that benefit from knowing who's logged in.
 */
exports.ifToken = (0, error_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token)
        return next();
    try {
        req.user = (0, jwt_1.verifyToken)(token);
    }
    catch {
        // silently ignore bad tokens on soft-protect routes
    }
    next();
});
//# sourceMappingURL=auth.js.map