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
const mongoose_1 = __importStar(require("mongoose"));
const hash_1 = require("../utils/hash");
//  Schema 
const OrganiserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    organisationName: {
        type: String,
        required: [true, 'Organisation name is required'],
        trim: true,
        maxlength: [150, 'Organisation name cannot exceed 150 characters'],
    },
    organisationDescription: {
        type: String,
        maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    logoUrl: { type: String },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    accountType: { type: String, enum: ['organiser'], default: 'organiser' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
//  Indexes 
OrganiserSchema.index({ email: 1 });
//  Instance Methods 
OrganiserSchema.methods.comparePassword = async function (plain) {
    return (0, hash_1.comparePassword)(plain, this.passwordHash);
};
OrganiserSchema.methods.getPublicProfile = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};
//  Static Methods 
OrganiserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};
//  Model 
const Organiser = mongoose_1.default.model('Organiser', OrganiserSchema);
exports.default = Organiser;
//# sourceMappingURL=Organiser.model.js.map