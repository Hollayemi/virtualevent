"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganiser = exports.getOrganiserById = exports.loginOrganiser = exports.registerOrganiser = void 0;
const Organiser_model_1 = __importDefault(require("../models/Organiser.model"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const error_1 = require("../middleware/error");
const registerOrganiser = async (input) => {
    const existing = await Organiser_model_1.default.findOne({ email: input.email.toLowerCase() });
    if (existing) {
        throw new error_1.AppError('An account with this email already exists', 409, 'CONFLICT');
    }
    const passwordHash = await (0, hash_1.hashPassword)(input.password);
    const organiser = await Organiser_model_1.default.create({
        ...input,
        email: input.email.toLowerCase(),
        passwordHash,
    });
    const token = (0, jwt_1.signToken)({ id: organiser.id, accountType: 'organiser' });
    return { organiser: organiser.getPublicProfile(), token };
};
exports.registerOrganiser = registerOrganiser;
const loginOrganiser = async (email, password) => {
    const organiser = await Organiser_model_1.default.findByEmail(email);
    if (!organiser) {
        throw new error_1.AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }
    const isMatch = await organiser.comparePassword(password);
    if (!isMatch) {
        throw new error_1.AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }
    const token = (0, jwt_1.signToken)({ id: organiser.id, accountType: 'organiser' });
    return { organiser: organiser.getPublicProfile(), token };
};
exports.loginOrganiser = loginOrganiser;
const getOrganiserById = async (id) => {
    const organiser = await Organiser_model_1.default.findById(id);
    if (!organiser) {
        throw new error_1.AppError('Organiser not found', 404, 'NOT_FOUND');
    }
    return organiser.getPublicProfile();
};
exports.getOrganiserById = getOrganiserById;
const updateOrganiser = async (id, input) => {
    const organiser = await Organiser_model_1.default.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
    if (!organiser) {
        throw new error_1.AppError('Organiser not found', 404, 'NOT_FOUND');
    }
    return organiser.getPublicProfile();
};
exports.updateOrganiser = updateOrganiser;
//# sourceMappingURL=organiser.service.js.map