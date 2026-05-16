"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const error_1 = require("../middleware/error");
const registerUser = async (input) => {
    const existing = await User_model_1.default.findOne({ email: input.email.toLowerCase() });
    if (existing) {
        throw new error_1.AppError('An account with this email already exists', 409, 'CONFLICT');
    }
    const passwordHash = await (0, hash_1.hashPassword)(input.password);
    const user = await User_model_1.default.create({
        ...input,
        email: input.email.toLowerCase(),
        passwordHash,
    });
    const token = (0, jwt_1.signToken)({ id: user.id, accountType: 'user' });
    return { user: user.getPublicProfile(), token };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await User_model_1.default.findByEmail(email);
    if (!user) {
        throw new error_1.AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new error_1.AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }
    const token = (0, jwt_1.signToken)({ id: user.id, accountType: 'user' });
    return { user: user.getPublicProfile(), token };
};
exports.loginUser = loginUser;
const getUserById = async (id) => {
    const user = await User_model_1.default.findById(id);
    if (!user) {
        throw new error_1.AppError('User not found', 404, 'NOT_FOUND');
    }
    return user.getPublicProfile();
};
exports.getUserById = getUserById;
const updateUser = async (id, input) => {
    // Deny password changes through this route
    const user = await User_model_1.default.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
    if (!user) {
        throw new error_1.AppError('User not found', 404, 'NOT_FOUND');
    }
    return user.getPublicProfile();
};
exports.updateUser = updateUser;
//# sourceMappingURL=user.service.js.map