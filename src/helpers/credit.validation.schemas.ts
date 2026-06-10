import Joi from 'joi';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

// ─── Credit Packages ──────────────────────────────────────────────────────────

export const createCreditPackageSchema = Joi.object({
    name: Joi.string().min(1).max(60).required().messages({
        'string.empty': 'Package name is required',
        'string.min': 'Package name must be at least 1 character',
        'string.max': 'Package name cannot exceed 60 characters',
        'any.required': 'Package name is required'
    }),
    description: Joi.string().max(200).optional(),
    credits: Joi.number().integer().min(1).required().messages({
        'number.base': 'Credits amount is required',
        'number.integer': 'Credits must be a whole number',
        'number.min': 'Package must contain at least 1 credit',
        'any.required': 'Credits amount is required'
    }),
    price: Joi.number().min(0).required().messages({
        'number.base': 'Price is required',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
    }),
    currency: Joi.string().max(10).optional().default('NGN'),
    isPopular: Joi.boolean().optional().default(false),
    sortOrder: Joi.number().integer().min(0).optional().default(0),
});

export const updateCreditPackageSchema = Joi.object({
    name: Joi.string().min(1).max(60).optional(),
    description: Joi.string().max(200).optional(),
    credits: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().max(10).optional(),
    isPopular: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
});

// ─── Credit Config ────────────────────────────────────────────────────────────

export const upsertCreditConfigSchema = Joi.object({
    cashbackRatio: Joi.number().min(0).max(1).required().messages({
        'number.base': 'Cashback ratio is required',
        'number.min': 'Cashback ratio cannot be less than 0',
        'number.max': 'Cashback ratio cannot exceed 1',
        'any.required': 'Cashback ratio is required'
    }),
    registrationRewardAmount: Joi.number().integer().min(0).required().messages({
        'number.base': 'Registration reward amount is required',
        'number.integer': 'Must be a whole number',
        'number.min': 'Cannot be negative',
        'any.required': 'Registration reward amount is required'
    }),
    referralRewardAmount: Joi.number().integer().min(0).required().messages({
        'number.base': 'Referral reward amount is required',
        'number.integer': 'Must be a whole number',
        'number.min': 'Cannot be negative',
        'any.required': 'Referral reward amount is required'
    }),
    vipRequestCost: Joi.number().integer().min(1).required().messages({
        'number.base': 'VIP request cost is required',
        'number.integer': 'Must be a whole number',
        'number.min': 'VIP request cost must be at least 1 credit',
        'any.required': 'VIP request cost is required'
    }),
});

// ─── Wallet / Purchase ────────────────────────────────────────────────────────

export const initiatePurchaseSchema = Joi.object({
    packageId: Joi.string().pattern(objectIdRegex).required().messages({
        'string.empty': 'Package ID is required',
        'string.pattern.base': 'Invalid package ID format',
        'any.required': 'Package ID is required'
    }),
});

// ─── VIP Protection Toggle ────────────────────────────────────────────────────

export const vipProtectionSchema = Joi.object({
    enabled: Joi.boolean().required().messages({
        'boolean.base': 'enabled must be true or false',
        'any.required': 'enabled must be true or false'
    }),
});