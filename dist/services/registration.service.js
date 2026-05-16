"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRegistration = exports.getUserRegistrations = exports.getEventRegistrations = exports.registerForEvent = void 0;
const Registration_model_1 = __importDefault(require("../models/Registration.model"));
const Event_model_1 = __importDefault(require("../models/Event.model"));
const error_1 = require("../middleware/error");
const registerForEvent = async (input) => {
    const { userId, eventId, tierId, customFieldValues = {} } = input;
    // Load event
    const event = await Event_model_1.default.findById(eventId);
    if (!event) {
        throw new error_1.AppError('Event not found', 404, 'NOT_FOUND');
    }
    if (event.status !== 'published') {
        throw new error_1.AppError('Registration is not open for this event', 400);
    }
    // Verify tier exists on this event
    const tier = event.getTierById(tierId);
    if (!tier) {
        throw new error_1.AppError('Invalid tier selected', 400);
    }
    // Check user is not already registered
    const existing = await Registration_model_1.default.findOne({ userId, eventId });
    if (existing) {
        throw new error_1.AppError('You are already registered for this event', 409, 'CONFLICT');
    }
    // Check capacity: count confirmed registrations for this tier
    if (tier.capacity > 0) {
        const confirmedCount = await Registration_model_1.default.countDocuments({
            eventId,
            tierId,
            status: 'confirmed',
        });
        if (event.isAtCapacity(tierId, confirmedCount)) {
            throw new error_1.AppError('This tier is at full capacity', 400);
        }
    }
    // Validate required custom fields
    const requiredFields = event.getRequiredCustomFields();
    for (const field of requiredFields) {
        const value = customFieldValues[field.fieldKey];
        if (value === undefined || value === null || value === '') {
            throw new error_1.AppError(`Required field "${field.label}" is missing`, 400);
        }
    }
    // Create registration
    const registration = await Registration_model_1.default.create({
        userId,
        eventId,
        tierId,
        tierLabel: tier.label,
        tierPrice: tier.price,
        status: 'confirmed', // auto-confirm for Milestone 1 (no payment)
        customFieldValues,
        confirmedAt: new Date(),
    });
    // Increment totalRegistrations counter on the event
    await Event_model_1.default.findByIdAndUpdate(eventId, { $inc: { totalRegistrations: 1 } });
    return registration.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'name startDate location' },
    ]);
};
exports.registerForEvent = registerForEvent;
const getEventRegistrations = async (eventId, organiserId) => {
    // Ownership check
    const event = await Event_model_1.default.findById(eventId);
    if (!event) {
        throw new error_1.AppError('Event not found', 404, 'NOT_FOUND');
    }
    if (event.organiserId.toString() !== organiserId) {
        throw new error_1.AppError('Not authorised to view registrations for this event', 403, 'FORBIDDEN');
    }
    const registrations = await Registration_model_1.default.find({ eventId })
        .populate('userId', 'name email company role industry avatarUrl')
        .sort({ createdAt: -1 })
        .lean();
    return registrations;
};
exports.getEventRegistrations = getEventRegistrations;
const getUserRegistrations = async (userId) => {
    const registrations = await Registration_model_1.default.find({ userId, status: { $ne: 'cancelled' } })
        .populate('eventId', 'name description startDate endDate location bannerUrl status')
        .sort({ registeredAt: -1 })
        .lean();
    return registrations;
};
exports.getUserRegistrations = getUserRegistrations;
const cancelRegistration = async (userId, registrationId) => {
    const registration = await Registration_model_1.default.findById(registrationId);
    if (!registration) {
        throw new error_1.AppError('Registration not found', 404, 'NOT_FOUND');
    }
    // Ownership check — only the registrant can cancel
    if (registration.userId.toString() !== userId) {
        throw new error_1.AppError('Not authorised to cancel this registration', 403, 'FORBIDDEN');
    }
    if (registration.status === 'cancelled') {
        throw new error_1.AppError('Registration is already cancelled', 400);
    }
    await registration.cancel();
    // Decrement totalRegistrations
    await Event_model_1.default.findByIdAndUpdate(registration.eventId, {
        $inc: { totalRegistrations: -1 },
    });
    return registration;
};
exports.cancelRegistration = cancelRegistration;
//# sourceMappingURL=registration.service.js.map