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
const uuid_1 = require("uuid");
const constants_1 = require("../utils/constants");
//  Sub-schemas 
const TierSchema = new mongoose_1.Schema({
    tierId: { type: String, default: () => (0, uuid_1.v4)() },
    label: {
        type: String,
        required: [true, 'Tier label is required'],
        trim: true,
        maxlength: [60, 'Tier label cannot exceed 60 characters'],
    },
    description: { type: String, maxlength: [200, 'Tier description cannot exceed 200 characters'] },
    price: {
        type: Number,
        required: [true, 'Tier price is required'],
        min: [0, 'Price cannot be negative'],
    },
    capacity: { type: Number, default: 0, min: 0 },
    isVIP: { type: Boolean, default: false },
    color: { type: String },
}, { _id: false });
const CustomFieldSchema = new mongoose_1.Schema({
    fieldKey: {
        type: String,
        required: [true, 'Field key is required'],
        match: [/^[a-zA-Z0-9_]+$/, 'Field key must be alphanumeric (underscores allowed)'],
    },
    label: { type: String, required: [true, 'Field label is required'], trim: true },
    type: {
        type: String,
        enum: constants_1.CUSTOM_FIELD_TYPES,
        required: [true, 'Field type is required'],
    },
    options: [{ type: String }],
    isRequired: { type: Boolean, default: false },
    placeholder: { type: String },
}, { _id: false });
const EventLocationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: constants_1.LOCATION_TYPES,
        required: [true, 'Location type is required'],
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    virtualLink: { type: String, trim: true },
}, { _id: false });
//  Main Schema 
const EventSchema = new mongoose_1.Schema({
    organiserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organiser',
        required: [true, 'Organiser ID is required'],
    },
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [150, 'Event name cannot exceed 150 characters'],
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
    location: {
        type: EventLocationSchema,
        required: [true, 'Location is required'],
    },
    bannerUrl: { type: String },
    status: {
        type: String,
        enum: constants_1.EVENT_STATUSES,
        default: 'draft',
    },
    tiers: {
        type: [TierSchema],
        validate: {
            validator: (tiers) => tiers.length >= 1,
            message: 'At least one tier is required',
        },
    },
    customFields: { type: [CustomFieldSchema], default: [] },
    totalRegistrations: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
//  Indexes 
EventSchema.index({ organiserId: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ 'tiers.price': 1 });
//  Pre-save: Mark highest tier as VIP & validate price uniqueness 
EventSchema.pre('save', function (next) {
    const event = this;
    if (!event.isModified('tiers'))
        return next();
    // Validate price uniqueness within tiers
    const prices = event.tiers.map((t) => t.price);
    const uniquePrices = new Set(prices);
    if (prices.length !== uniquePrices.size) {
        return next(new Error('Each tier must have a unique price'));
    }
    // Validate endDate > startDate
    if (event.endDate <= event.startDate) {
        return next(new Error('End date must be after start date'));
    }
    // Derive isVIP: tier with highest price
    const maxPrice = Math.max(...prices);
    event.tiers.forEach((tier) => {
        tier.isVIP = tier.price === maxPrice;
    });
    // Ensure each tier has a tierId
    event.tiers.forEach((tier) => {
        if (!tier.tierId) {
            tier.tierId = (0, uuid_1.v4)();
        }
    });
    next();
});
//  Instance Methods 
EventSchema.methods.getTierByPrice = function (price) {
    return this.tiers.find((t) => t.price === price);
};
EventSchema.methods.getTierById = function (tierId) {
    return this.tiers.find((t) => t.tierId === tierId);
};
/**
 * Pass in the CURRENT registration count for this tier.
 * Returns true if the tier is full (capacity > 0 and count >= capacity).
 */
EventSchema.methods.isAtCapacity = function (tierId, currentCount) {
    const tier = this.getTierById(tierId);
    if (!tier)
        return true; // unknown tier → block
    if (tier.capacity === 0)
        return false; // unlimited
    return currentCount >= tier.capacity;
};
EventSchema.methods.getHighestTier = function () {
    if (!this.tiers.length)
        return undefined;
    return this.tiers.reduce((max, t) => (t.price > max.price ? t : max));
};
EventSchema.methods.getRequiredCustomFields = function () {
    return this.customFields.filter((f) => f.isRequired);
};
//  Model 
const Event = mongoose_1.default.model('Event', EventSchema);
exports.default = Event;
//# sourceMappingURL=Event.model.js.map