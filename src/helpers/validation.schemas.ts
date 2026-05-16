import { z } from 'zod';
import { INTENTION_TAGS, CUSTOM_FIELD_TYPES, LOCATION_TYPES } from '../utils/constants';

//  Auth 

export const registerUserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    role: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    interests: z.array(z.string()).optional(),
    networkingGoals: z.string().max(300).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    role: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    interests: z.array(z.string()).optional(),
    networkingGoals: z.string().max(300).optional(),
    avatarUrl: z.string().url('Invalid URL').optional(),
});

//  Organiser 

export const registerOrganiserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    organisationName: z.string().min(1, 'Organisation name is required').max(150),
    organisationDescription: z.string().max(600).optional(),
    website: z.string().url('Invalid website URL').optional(),
    phone: z.string().optional(),
});

export const updateOrganiserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    organisationName: z.string().min(1).max(150).optional(),
    organisationDescription: z.string().max(600).optional(),
    logoUrl: z.string().url('Invalid URL').optional(),
    website: z.string().url('Invalid website URL').optional(),
    phone: z.string().optional(),
});

//  Event 

const tierSchema = z.object({
    label: z.string().min(1, 'Tier label is required').max(60),
    description: z.string().max(200).optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    capacity: z.number().int().min(0).optional().default(0),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
});

const customFieldSchema = z.object({
    fieldKey: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9_]+$/, 'Field key must be alphanumeric (underscores allowed)'),
    label: z.string().min(1, 'Field label is required'),
    type: z.enum(CUSTOM_FIELD_TYPES),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean().optional().default(false),
    placeholder: z.string().optional(),
});

const locationSchema = z.object({
    type: z.enum(LOCATION_TYPES),
    address: z.string().optional(),
    city: z.string().optional(),
    virtualLink: z.string().url('Invalid virtual link URL').optional(),
});

export const createEventSchema = z
    .object({
        name: z.string().min(1, 'Event name is required').max(150),
        description: z.string().min(1, 'Description is required').max(2000),
        startDate: z.string().datetime({ message: 'Invalid start date (use ISO 8601)' }),
        endDate: z.string().datetime({ message: 'Invalid end date (use ISO 8601)' }),
        location: locationSchema,
        bannerUrl: z.string().url('Invalid banner URL').optional(),
        tiers: z
            .array(tierSchema)
            .min(1, 'At least one tier is required')
            .refine(
                (tiers) => new Set(tiers.map((t) => t.price)).size === tiers.length,
                { message: 'Each tier must have a unique price' },
            ),
        customFields: z
            .array(customFieldSchema)
            .optional()
            .refine(
                (fields) => {
                    if (!fields) return true;
                    const keys = fields.map((f) => f.fieldKey);
                    return new Set(keys).size === keys.length;
                },
                { message: 'Each custom field must have a unique fieldKey' },
            ),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
        message: 'End date must be after start date',
        path: ['endDate'],
    });

export const updateEventSchema = z.object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().min(1).max(2000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: locationSchema.partial().optional(),
    bannerUrl: z.string().url().optional(),
    tiers: z
        .array(tierSchema)
        .min(1)
        .optional()
        .refine(
            (tiers) => {
                if (!tiers) return true;
                return new Set(tiers.map((t) => t.price)).size === tiers.length;
            },
            { message: 'Each tier must have a unique price' },
        ),
    customFields: z.array(customFieldSchema).optional(),
});

//  Registration 

export const registerForEventSchema = z.object({
    tierId: z.string().min(1, 'Tier selection is required'),
    customFieldValues: z.record(z.union([z.string(), z.boolean(), z.number()])).optional(),
});

//  Connection 

export const sendConnectionSchema = z.object({
    recipientId: z.string().min(1, 'Recipient ID is required'),
    intentionTag: z.enum(INTENTION_TAGS, {
        errorMap: () => ({ message: `Intention tag must be one of: ${INTENTION_TAGS.join(', ')}` }),
    }),
    message: z.string().max(300, 'Message cannot exceed 300 characters').optional(),
});

export const respondConnectionSchema = z.object({
    action: z.enum(['accept', 'decline'], {
        errorMap: () => ({ message: 'Action must be "accept" or "decline"' }),
    }),
});
