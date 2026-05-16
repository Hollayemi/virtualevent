"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganiserEvents = exports.publishEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const Event_model_1 = __importDefault(require("../models/Event.model"));
const error_1 = require("../middleware/error");
const createEvent = async (organiserId, input) => {
    // Validate date ordering at service level as well
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (endDate <= startDate) {
        throw new error_1.AppError('End date must be after start date', 400);
    }
    // Validate tier price uniqueness
    const prices = input.tiers.map((t) => t.price);
    if (new Set(prices).size !== prices.length) {
        throw new error_1.AppError('Each tier must have a unique price', 400);
    }
    // Validate fieldKey uniqueness in customFields
    if (input.customFields?.length) {
        const keys = input.customFields.map((f) => f.fieldKey);
        if (new Set(keys).size !== keys.length) {
            throw new error_1.AppError('Each custom field must have a unique fieldKey', 400);
        }
    }
    const event = await Event_model_1.default.create({
        organiserId,
        ...input,
        startDate,
        endDate,
    });
    return event;
};
exports.createEvent = createEvent;
const getEvents = async (query) => {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const filter = { status: 'published' };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }
    const [events, total] = await Promise.all([
        Event_model_1.default.find(filter)
            .populate('organiserId', 'name organisationName logoUrl')
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Event_model_1.default.countDocuments(filter),
    ]);
    return {
        events,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getEvents = getEvents;
const getEventById = async (eventId) => {
    const event = await Event_model_1.default.findById(eventId).populate('organiserId', 'name organisationName logoUrl website');
    if (!event) {
        throw new error_1.AppError('Event not found', 404, 'NOT_FOUND');
    }
    return event;
};
exports.getEventById = getEventById;
const updateEvent = async (organiserId, eventId, input) => {
    const event = await Event_model_1.default.findById(eventId);
    if (!event) {
        throw new error_1.AppError('Event not found', 404, 'NOT_FOUND');
    }
    // Ownership check
    if (event.organiserId.toString() !== organiserId) {
        throw new error_1.AppError('You are not authorised to update this event', 403, 'FORBIDDEN');
    }
    // Guard: cannot modify tiers or customFields once published
    if (event.status === 'published' && (input.tiers || input.customFields)) {
        throw new error_1.AppError('Tiers and custom fields cannot be modified after an event is published', 400);
    }
    // Validate updated tier prices if provided
    if (input.tiers) {
        const prices = input.tiers.map((t) => t.price);
        if (new Set(prices).size !== prices.length) {
            throw new error_1.AppError('Each tier must have a unique price', 400);
        }
    }
    Object.assign(event, input);
    await event.save();
    return event;
};
exports.updateEvent = updateEvent;
const publishEvent = async (organiserId, eventId) => {
    const event = await Event_model_1.default.findById(eventId);
    if (!event) {
        throw new error_1.AppError('Event not found', 404, 'NOT_FOUND');
    }
    if (event.organiserId.toString() !== organiserId) {
        throw new error_1.AppError('You are not authorised to publish this event', 403, 'FORBIDDEN');
    }
    if (event.status === 'published') {
        throw new error_1.AppError('Event is already published', 400);
    }
    if (!event.tiers.length) {
        throw new error_1.AppError('An event must have at least one tier before publishing', 400);
    }
    event.status = 'published';
    await event.save();
    return event;
};
exports.publishEvent = publishEvent;
const getOrganiserEvents = async (organiserId) => {
    const events = await Event_model_1.default.find({ organiserId })
        .sort({ createdAt: -1 })
        .lean();
    return events;
};
exports.getOrganiserEvents = getOrganiserEvents;
//# sourceMappingURL=event.service.js.map