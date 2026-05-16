"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateMe = exports.getMe = exports.loginOrganiser = exports.registerOrganiser = void 0;
const error_1 = require("../middleware/error");
const organiserService = __importStar(require("../services/organiser.service"));
const jwt_1 = require("../utils/jwt");
exports.registerOrganiser = (0, error_1.asyncHandler)(async (req, res) => {
    const { organiser, token } = await organiserService.registerOrganiser(req.body);
    (0, jwt_1.attachCookie)(res, token);
    res.data({ organiser, token }, 'Organiser account created', 201);
});
exports.loginOrganiser = (0, error_1.asyncHandler)(async (req, res) => {
    const { organiser, token } = await organiserService.loginOrganiser(req.body.email, req.body.password);
    (0, jwt_1.attachCookie)(res, token);
    res.data({ organiser, token }, 'Login successful');
});
exports.getMe = (0, error_1.asyncHandler)(async (req, res) => {
    const organiser = await organiserService.getOrganiserById(req.user.id);
    res.data({ organiser }, 'Profile retrieved');
});
exports.updateMe = (0, error_1.asyncHandler)(async (req, res) => {
    const organiser = await organiserService.updateOrganiser(req.user.id, req.body);
    res.data({ organiser }, 'Profile updated');
});
exports.logout = (0, error_1.asyncHandler)(async (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.success('Logged out successfully');
});
//# sourceMappingURL=organiser.controller.js.map