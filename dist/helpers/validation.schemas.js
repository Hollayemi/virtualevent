"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondConnectionSchema = exports.sendConnectionSchema = exports.registerForEventSchema = exports.updateEventSchema = exports.createEventSchema = exports.updateOrganiserSchema = exports.registerOrganiserSchema = exports.updateUserSchema = exports.loginSchema = exports.registerUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../utils/constants");
// ─── Auth ────────────────────────────────────────────────────────────────────
exports.registerUserSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    phone: joi_1.default.string().optional().allow(''),
    bio: joi_1.default.string().max(500).optional().allow(''),
    role: joi_1.default.string().max(100).optional().allow(''),
    company: joi_1.default.string().max(100).optional().allow(''),
    industry: joi_1.default.string().max(100).optional().allow(''),
    interests: joi_1.default.array().items(joi_1.default.string()).optional(),
    networkingGoals: joi_1.default.string().max(300).optional().allow(''),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});
exports.updateUserSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    phone: joi_1.default.string().optional().allow(''),
    bio: joi_1.default.string().max(500).optional().allow(''),
    role: joi_1.default.string().max(100).optional().allow(''),
    company: joi_1.default.string().max(100).optional().allow(''),
    industry: joi_1.default.string().max(100).optional().allow(''),
    interests: joi_1.default.array().items(joi_1.default.string()).optional(),
    networkingGoals: joi_1.default.string().max(300).optional().allow(''),
    avatarUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid URL',
    }),
});
// ─── Organiser ───────────────────────────────────────────────────────────────
exports.registerOrganiserSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    organisationName: joi_1.default.string().min(1).max(150).required().messages({
        'string.empty': 'Organisation name is required',
        'any.required': 'Organisation name is required',
    }),
    organisationDescription: joi_1.default.string().max(600).optional().allow(''),
    website: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid website URL',
    }),
    phone: joi_1.default.string().optional().allow(''),
});
exports.updateOrganiserSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    organisationName: joi_1.default.string().min(1).max(150).optional(),
    organisationDescription: joi_1.default.string().max(600).optional().allow(''),
    logoUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid URL',
    }),
    website: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid website URL',
    }),
    phone: joi_1.default.string().optional().allow(''),
});
// ─── Event ───────────────────────────────────────────────────────────────────
const tierSchema = joi_1.default.object({
    label: joi_1.default.string().min(1).max(60).required().messages({
        'string.empty': 'Tier label is required',
        'any.required': 'Tier label is required',
    }),
    description: joi_1.default.string().max(200).optional().allow(''),
    price: joi_1.default.number().min(0).required().messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required',
    }),
    capacity: joi_1.default.number().integer().min(0).default(0),
    color: joi_1.default.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .messages({ 'string.pattern.base': 'Color must be a valid hex code' }),
});
const customFieldSchema = joi_1.default.object({
    fieldKey: joi_1.default.string()
        .min(1)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
        'string.pattern.base': 'Field key must be alphanumeric (underscores allowed)',
        'any.required': 'Field key is required',
    }),
    label: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Field label is required',
        'any.required': 'Field label is required',
    }),
    type: joi_1.default.string()
        .valid(...constants_1.CUSTOM_FIELD_TYPES)
        .required()
        .messages({
        'any.only': `Field type must be one of: ${constants_1.CUSTOM_FIELD_TYPES.join(', ')}`,
    }),
    options: joi_1.default.array().items(joi_1.default.string()).optional(),
    isRequired: joi_1.default.boolean().default(false),
    placeholder: joi_1.default.string().optional().allow(''),
});
const locationSchema = joi_1.default.object({
    type: joi_1.default.string()
        .valid(...constants_1.LOCATION_TYPES)
        .required()
        .messages({
        'any.only': `Location type must be one of: ${constants_1.LOCATION_TYPES.join(', ')}`,
    }),
    address: joi_1.default.string().optional().allow(''),
    city: joi_1.default.string().optional().allow(''),
    virtualLink: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid virtual link URL',
    }),
});
exports.createEventSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(150).required().messages({
        'string.empty': 'Event name is required',
        'any.required': 'Event name is required',
    }),
    description: joi_1.default.string().min(1).max(2000).required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
    }),
    startDate: joi_1.default.string().isoDate().required().messages({
        'string.isoDate': 'Invalid start date (use ISO 8601)',
        'any.required': 'Start date is required',
    }),
    endDate: joi_1.default.string().isoDate().required().messages({
        'string.isoDate': 'Invalid end date (use ISO 8601)',
        'any.required': 'End date is required',
    }),
    location: locationSchema.required(),
    bannerUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid banner URL',
    }),
    tiers: joi_1.default.array()
        .items(tierSchema)
        .min(1)
        .required()
        .custom((tiers, helpers) => {
        const prices = tiers.map((t) => t.price);
        if (new Set(prices).size !== prices.length) {
            return helpers.error('any.invalid');
        }
        return tiers;
    })
        .messages({
        'array.min': 'At least one tier is required',
        'any.required': 'Tiers are required',
        'any.invalid': 'Each tier must have a unique price',
    }),
    customFields: joi_1.default.array()
        .items(customFieldSchema)
        .optional()
        .custom((fields, helpers) => {
        if (!fields || fields.length === 0)
            return fields;
        const keys = fields.map((f) => f.fieldKey);
        if (new Set(keys).size !== keys.length) {
            return helpers.error('any.invalid');
        }
        return fields;
    })
        .messages({
        'any.invalid': 'Each custom field must have a unique fieldKey',
    }),
})
    // Cross-field: endDate must be after startDate
    .custom((value, helpers) => {
    if (new Date(value.endDate) <= new Date(value.startDate)) {
        return helpers.error('any.invalid');
    }
    return value;
})
    .messages({
    'any.invalid': 'End date must be after start date',
});
exports.updateEventSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(150).optional(),
    description: joi_1.default.string().min(1).max(2000).optional(),
    startDate: joi_1.default.string().isoDate().optional().messages({
        'string.isoDate': 'Invalid start date (use ISO 8601)',
    }),
    endDate: joi_1.default.string().isoDate().optional().messages({
        'string.isoDate': 'Invalid end date (use ISO 8601)',
    }),
    location: locationSchema.optional(),
    bannerUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Invalid banner URL',
    }),
    tiers: joi_1.default.array()
        .items(tierSchema)
        .min(1)
        .optional()
        .custom((tiers, helpers) => {
        if (!tiers)
            return tiers;
        const prices = tiers.map((t) => t.price);
        if (new Set(prices).size !== prices.length) {
            return helpers.error('any.invalid');
        }
        return tiers;
    })
        .messages({ 'any.invalid': 'Each tier must have a unique price' }),
    customFields: joi_1.default.array().items(customFieldSchema).optional(),
});
// ─── Registration ─────────────────────────────────────────────────────────────
exports.registerForEventSchema = joi_1.default.object({
    tierId: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Tier selection is required',
        'any.required': 'Tier selection is required',
    }),
    customFieldValues: joi_1.default.object()
        .pattern(joi_1.default.string(), joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.boolean(), joi_1.default.number()))
        .optional(),
});
// ─── Connection ───────────────────────────────────────────────────────────────
exports.sendConnectionSchema = joi_1.default.object({
    recipientId: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Recipient ID is required',
        'any.required': 'Recipient ID is required',
    }),
    intentionTag: joi_1.default.string()
        .valid(...constants_1.INTENTION_TAGS)
        .required()
        .messages({
        'any.only': `Intention tag must be one of: ${constants_1.INTENTION_TAGS.join(', ')}`,
        'any.required': 'Intention tag is required',
    }),
    message: joi_1.default.string().max(300).optional().allow('').messages({
        'string.max': 'Message cannot exceed 300 characters',
    }),
});
exports.respondConnectionSchema = joi_1.default.object({
    action: joi_1.default.string().valid('accept', 'decline').required().messages({
        'any.only': 'Action must be "accept" or "decline"',
        'any.required': 'Action is required',
    }),
});
//# sourceMappingURL=validation.schemas.js.map