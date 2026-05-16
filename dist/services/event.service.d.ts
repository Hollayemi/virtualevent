import { IEventDocument } from '../models/Event.model';
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
export declare const createEvent: (organiserId: string, input: CreateEventInput) => Promise<import("mongoose").Document<unknown, {}, IEventDocument, {}, {}> & IEventDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getEvents: (query: GetEventsQuery) => Promise<{
    events: (import("mongoose").FlattenMaps<IEventDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getEventById: (eventId: string) => Promise<import("mongoose").Document<unknown, {}, IEventDocument, {}, {}> & IEventDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateEvent: (organiserId: string, eventId: string, input: UpdateEventInput) => Promise<import("mongoose").Document<unknown, {}, IEventDocument, {}, {}> & IEventDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const publishEvent: (organiserId: string, eventId: string) => Promise<import("mongoose").Document<unknown, {}, IEventDocument, {}, {}> & IEventDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getOrganiserEvents: (organiserId: string) => Promise<(import("mongoose").FlattenMaps<IEventDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export {};
//# sourceMappingURL=event.service.d.ts.map