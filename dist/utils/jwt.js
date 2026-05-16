"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachCookie = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRE,
    });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
const attachCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env_1.env.isProd(),
        sameSite: env_1.env.isProd() ? 'strict' : 'lax',
        maxAge: env_1.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });
};
exports.attachCookie = attachCookie;
//# sourceMappingURL=jwt.js.map