interface RegisterForEventInput {
    userId: string;
    eventId: string;
    tierId: string;
    customFieldValues?: Record<string, string | boolean | number>;
}
export declare const registerForEvent: (input: RegisterForEventInput) => Promise<Omit<import("mongoose").Document<unknown, {}, import("../models/Registration.model").IRegistrationDocument, {}, {}> & import("../models/Registration.model").IRegistrationDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, never>>;
export declare const getEventRegistrations: (eventId: string, organiserId: string) => Promise<(import("mongoose").FlattenMaps<import("../models/Registration.model").IRegistrationDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getUserRegistrations: (userId: string) => Promise<(import("mongoose").FlattenMaps<import("../models/Registration.model").IRegistrationDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const cancelRegistration: (userId: string, registrationId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Registration.model").IRegistrationDocument, {}, {}> & import("../models/Registration.model").IRegistrationDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export {};
//# sourceMappingURL=registration.service.d.ts.map