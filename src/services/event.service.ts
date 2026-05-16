import Event, { IEventDocument, ITier, ICustomField } from '../models/Event.model';
import { AppError } from '../middleware/error';
import { IEventLocation } from '../models/Event.model';

interface CreateEventInput {
    name: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    location: IEventLocation;
    bannerUrl?: string;
    tiers: Array<{
        label: string;
        description?: string;
        price: number;
        capacity?: number;
        color?: string;
    }>;
    customFields?: Array<{
        fieldKey: string;
        label: string;
        type: string;
        options?: string[];
        isRequired?: boolean;
        placeholder?: string;
    }>;
}

interface UpdateEventInput {
    name?: string;
    description?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    location?: Partial<IEventLocation>;
    bannerUrl?: string;
    tiers?: CreateEventInput['tiers'];
    customFields?: CreateEventInput['customFields'];
}

interface GetEventsQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export const createEvent = async (organiserId: string, input: CreateEventInput) => {
    // Validate date ordering at service level as well
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (endDate <= startDate) {
        throw new AppError('End date must be after start date', 400);
    }

    // Validate tier price uniqueness
    const prices = input.tiers.map((t) => t.price);
    if (new Set(prices).size !== prices.length) {
        throw new AppError('Each tier must have a unique price', 400);
    }

    // Validate fieldKey uniqueness in customFields
    if (input.customFields?.length) {
        const keys = input.customFields.map((f) => f.fieldKey);
        if (new Set(keys).size !== keys.length) {
            throw new AppError('Each custom field must have a unique fieldKey', 400);
        }
    }

    const event = await Event.create({
        organiserId,
        ...input,
        startDate,
        endDate,
    });

    return event;
};

export const getEvents = async (query: GetEventsQuery) => {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: 'published' };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate('organiserId', 'name organisationName logoUrl')
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Event.countDocuments(filter),
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

export const getEventById = async (eventId: string) => {
    const event = await Event.findById(eventId).populate(
        'organiserId',
        'name organisationName logoUrl website',
    );

    if (!event) {
        throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    return event;
};

export const updateEvent = async (
    organiserId: string,
    eventId: string,
    input: UpdateEventInput,
) => {
    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    // Ownership check
    if (event.organiserId.toString() !== organiserId) {
        throw new AppError('You are not authorised to update this event', 403, 'FORBIDDEN');
    }

    // Guard: cannot modify tiers or customFields once published
    if (event.status === 'published' && (input.tiers || input.customFields)) {
        throw new AppError(
            'Tiers and custom fields cannot be modified after an event is published',
            400,
        );
    }

    // Validate updated tier prices if provided
    if (input.tiers) {
        const prices = input.tiers.map((t) => t.price);
        if (new Set(prices).size !== prices.length) {
            throw new AppError('Each tier must have a unique price', 400);
        }
    }

    Object.assign(event, input);
    await event.save();

    return event;
};

export const publishEvent = async (organiserId: string, eventId: string) => {
    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    if (event.organiserId.toString() !== organiserId) {
        throw new AppError('You are not authorised to publish this event', 403, 'FORBIDDEN');
    }

    if (event.status === 'published') {
        throw new AppError('Event is already published', 400);
    }

    if (!event.tiers.length) {
        throw new AppError('An event must have at least one tier before publishing', 400);
    }

    event.status = 'published';
    await event.save();

    return event;
};

export const getOrganiserEvents = async (organiserId: string) => {
    const events = await Event.find({ organiserId })
        .sort({ createdAt: -1 })
        .lean();

    return events;
};
