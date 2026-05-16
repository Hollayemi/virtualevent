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
const constants_1 = require("../utils/constants");
//  Schema 
const RegistrationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required'],
    },
    tierId: {
        type: String,
        required: [true, 'Tier ID is required'],
    },
    tierLabel: {
        type: String,
        required: [true, 'Tier label is required'],
    },
    tierPrice: {
        type: Number,
        required: [true, 'Tier price is required'],
        min: 0,
    },
    status: {
        type: String,
        enum: constants_1.REGISTRATION_STATUSES,
        default: 'pending',
    },
    customFieldValues: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    confirmedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
//  Indexes 
// One registration per user per event — enforced at DB level
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, tierId: 1 });
RegistrationSchema.index({ eventId: 1, status: 1 });
RegistrationSchema.index({ userId: 1, status: 1 });
//  Instance Methods 
RegistrationSchema.methods.confirm = async function () {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return this.save();
};
RegistrationSchema.methods.cancel = async function () {
    this.status = 'cancelled';
    return this.save();
};
//  Model 
const Registration = mongoose_1.default.model('Registration', RegistrationSchema);
exports.default = Registration;
//# sourceMappingURL=Registration.model.js.map