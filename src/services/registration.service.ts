import Registration from '../models/Registration.model';
import Event from '../models/Event.model';
import { AppError } from '../middleware/error';

interface RegisterForEventInput {
    userId: string;
    eventId: string;
    tierId: string;
    customFieldValues?: Record<string, string | boolean | number>;
}

export const registerForEvent = async (input: RegisterForEventInput) => {
    const { userId, eventId, tierId, customFieldValues = {} } = input;

    // Load event
    const event = await Event.findById(eventId);
    if (!event) {
        throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    if (event.status !== 'published') {
        throw new AppError('Registration is not open for this event', 400);
    }

    // Verify tier exists on this event
    const tier = event.getTierById(tierId);
    if (!tier) {
        throw new AppError('Invalid tier selected', 400);
    }

    // Check user is not already registered
    const existing = await Registration.findOne({ userId, eventId });
    if (existing) {
        throw new AppError('You are already registered for this event', 409, 'CONFLICT');
    }

    // Check capacity: count confirmed registrations for this tier
    if (tier.capacity > 0) {
        const confirmedCount = await Registration.countDocuments({
            eventId,
            tierId,
            status: 'confirmed',
        });

        if (event.isAtCapacity(tierId, confirmedCount)) {
            throw new AppError('This tier is at full capacity', 400);
        }
    }

    // Validate required custom fields
    const requiredFields = event.getRequiredCustomFields();
    for (const field of requiredFields) {
        const value = customFieldValues[field.fieldKey];
        if (value === undefined || value === null || value === '') {
            throw new AppError(
                `Required field "${field.label}" is missing`,
                400,
            );
        }
    }

    // Create registration
    const registration = await Registration.create({
        userId,
        eventId,
        tierId,
        tierLabel: tier.label,
        tierPrice: tier.price,
        status: 'confirmed',           // auto-confirm for Milestone 1 (no payment)
        customFieldValues,
        confirmedAt: new Date(),
    });

    // Increment totalRegistrations counter on the event
    await Event.findByIdAndUpdate(eventId, { $inc: { totalRegistrations: 1 } });

    return registration.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'name startDate location' },
    ]);
};

export const getEventRegistrations = async (eventId: string, organiserId: string) => {
    // Ownership check
    const event = await Event.findById(eventId);
    if (!event) {
        throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    if (event.organiserId.toString() !== organiserId) {
        throw new AppError('Not authorised to view registrations for this event', 403, 'FORBIDDEN');
    }

    const registrations = await Registration.find({ eventId })
        .populate('userId', 'name email company role industry avatarUrl')
        .sort({ createdAt: -1 })
        .lean();

    return registrations;
};

export const getUserRegistrations = async (userId: string) => {
    const registrations = await Registration.find({ userId, status: { $ne: 'cancelled' } })
        .populate('eventId', 'name description startDate endDate location bannerUrl status')
        .sort({ registeredAt: -1 })
        .lean();

    return registrations;
};

export const cancelRegistration = async (userId: string, registrationId: string) => {
    const registration = await Registration.findById(registrationId);

    if (!registration) {
        throw new AppError('Registration not found', 404, 'NOT_FOUND');
    }

    // Ownership check — only the registrant can cancel
    if (registration.userId.toString() !== userId) {
        throw new AppError('Not authorised to cancel this registration', 403, 'FORBIDDEN');
    }

    if (registration.status === 'cancelled') {
        throw new AppError('Registration is already cancelled', 400);
    }

    await registration.cancel();

    // Decrement totalRegistrations
    await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { totalRegistrations: -1 },
    });

    return registration;
};
