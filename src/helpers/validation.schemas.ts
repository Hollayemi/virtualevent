import Joi from 'joi';
import { INTENTION_TAGS, CUSTOM_FIELD_TYPES, LOCATION_TYPES } from '../utils/constants';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    phone: Joi.string().optional().allow(''),
    bio: Joi.string().max(500).optional().allow(''),
    role: Joi.string().max(100).optional().allow(''),
    company: Joi.string().max(100).optional().allow(''),
    industry: Joi.string().max(100).optional().allow(''),
    interests: Joi.array().items(Joi.string()).optional(),
    networkingGoals: Joi.string().max(300).optional().allow(''),
});

export const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(1).required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().optional().allow(''),
    bio: Joi.string().max(500).optional().allow(''),
    role: Joi.string().max(100).optional().allow(''),
    company: Joi.string().max(100).optional().allow(''),
    industry: Joi.string().max(100).optional().allow(''),
    interests: Joi.array().items(Joi.string()).optional(),
    networkingGoals: Joi.string().max(300).optional().allow(''),
    avatarUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid URL',
    }),
});

// ─── Organiser ───────────────────────────────────────────────────────────────

export const registerOrganiserSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    organisationName: Joi.string().min(1).max(150).required().messages({
        'string.empty': 'Organisation name is required',
        'any.required': 'Organisation name is required',
    }),
    organisationDescription: Joi.string().max(600).optional().allow(''),
    website: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid website URL',
    }),
    phone: Joi.string().optional().allow(''),
});

export const updateOrganiserSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    organisationName: Joi.string().min(1).max(150).optional(),
    organisationDescription: Joi.string().max(600).optional().allow(''),
    logoUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid URL',
    }),
    website: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid website URL',
    }),
    phone: Joi.string().optional().allow(''),
});

// ─── Event ───────────────────────────────────────────────────────────────────

const tierSchema = Joi.object({
    label: Joi.string().min(1).max(60).required().messages({
        'string.empty': 'Tier label is required',
        'any.required': 'Tier label is required',
    }),
    description: Joi.string().max(200).optional().allow(''),
    price: Joi.number().min(0).required().messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required',
    }),
    capacity: Joi.number().integer().min(0).default(0),
    color: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .messages({ 'string.pattern.base': 'Color must be a valid hex code' }),
});

const customFieldSchema = Joi.object({
    fieldKey: Joi.string()
        .min(1)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Field key must be alphanumeric (underscores allowed)',
            'any.required': 'Field key is required',
        }),
    label: Joi.string().min(1).required().messages({
        'string.empty': 'Field label is required',
        'any.required': 'Field label is required',
    }),
    type: Joi.string()
        .valid(...CUSTOM_FIELD_TYPES)
        .required()
        .messages({
            'any.only': `Field type must be one of: ${CUSTOM_FIELD_TYPES.join(', ')}`,
        }),
    options: Joi.array().items(Joi.string()).optional(),
    isRequired: Joi.boolean().default(false),
    placeholder: Joi.string().optional().allow(''),
});

const locationSchema = Joi.object({
    type: Joi.string()
        .valid(...LOCATION_TYPES)
        .required()
        .messages({
            'any.only': `Location type must be one of: ${LOCATION_TYPES.join(', ')}`,
        }),
    address: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    virtualLink: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid virtual link URL',
    }),
});

export const createEventSchema = Joi.object({
    name: Joi.string().min(1).max(150).required().messages({
        'string.empty': 'Event name is required',
        'any.required': 'Event name is required',
    }),
    description: Joi.string().min(1).max(2000).required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
    }),
    startDate: Joi.string().isoDate().required().messages({
        'string.isoDate': 'Invalid start date (use ISO 8601)',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.string().isoDate().required().messages({
        'string.isoDate': 'Invalid end date (use ISO 8601)',
        'any.required': 'End date is required',
    }),
    location: locationSchema.required(),
    bannerUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid banner URL',
    }),
    tiers: Joi.array()
        .items(tierSchema)
        .min(1)
        .required()
        .custom((tiers, helpers) => {
            const prices = tiers.map((t: { price: number }) => t.price);
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
    customFields: Joi.array()
        .items(customFieldSchema)
        .optional()
        .custom((fields, helpers) => {
            if (!fields || fields.length === 0) return fields;
            const keys = fields.map((f: { fieldKey: string }) => f.fieldKey);
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

export const updateEventSchema = Joi.object({
    name: Joi.string().min(1).max(150).optional(),
    description: Joi.string().min(1).max(2000).optional(),
    startDate: Joi.string().isoDate().optional().messages({
        'string.isoDate': 'Invalid start date (use ISO 8601)',
    }),
    endDate: Joi.string().isoDate().optional().messages({
        'string.isoDate': 'Invalid end date (use ISO 8601)',
    }),
    location: locationSchema.optional(),
    bannerUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Invalid banner URL',
    }),
    tiers: Joi.array()
        .items(tierSchema)
        .min(1)
        .optional()
        .custom((tiers, helpers) => {
            if (!tiers) return tiers;
            const prices = tiers.map((t: { price: number }) => t.price);
            if (new Set(prices).size !== prices.length) {
                return helpers.error('any.invalid');
            }
            return tiers;
        })
        .messages({ 'any.invalid': 'Each tier must have a unique price' }),
    customFields: Joi.array().items(customFieldSchema).optional(),
});

// ─── Registration ─────────────────────────────────────────────────────────────

export const registerForEventSchema = Joi.object({
    tierId: Joi.string().min(1).required().messages({
        'string.empty': 'Tier selection is required',
        'any.required': 'Tier selection is required',
    }),
    customFieldValues: Joi.object()
        .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.boolean(), Joi.number()))
        .optional(),
});

// ─── Connection ───────────────────────────────────────────────────────────────

export const sendConnectionSchema = Joi.object({
    recipientId: Joi.string().min(1).required().messages({
        'string.empty': 'Recipient ID is required',
        'any.required': 'Recipient ID is required',
    }),
    intentionTag: Joi.string()
        .valid(...INTENTION_TAGS)
        .required()
        .messages({
            'any.only': `Intention tag must be one of: ${INTENTION_TAGS.join(', ')}`,
            'any.required': 'Intention tag is required',
        }),
    message: Joi.string().max(300).optional().allow('').messages({
        'string.max': 'Message cannot exceed 300 characters',
    }),
});

export const respondConnectionSchema = Joi.object({
    action: Joi.string().valid('accept', 'decline').required().messages({
        'any.only': 'Action must be "accept" or "decline"',
        'any.required': 'Action is required',
    }),
});