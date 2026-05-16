interface RegisterOrganiserInput {
    name: string;
    email: string;
    password: string;
    organisationName: string;
    organisationDescription?: string;
    website?: string;
    phone?: string;
}
interface UpdateOrganiserInput {
    name?: string;
    organisationName?: string;
    organisationDescription?: string;
    logoUrl?: string;
    website?: string;
    phone?: string;
}
export declare const registerOrganiser: (input: RegisterOrganiserInput) => Promise<{
    organiser: Omit<import("../models/Organiser.model").IOrganiser, "passwordHash">;
    token: string;
}>;
export declare const loginOrganiser: (email: string, password: string) => Promise<{
    organiser: Omit<import("../models/Organiser.model").IOrganiser, "passwordHash">;
    token: string;
}>;
export declare const getOrganiserById: (id: string) => Promise<Omit<import("../models/Organiser.model").IOrganiser, "passwordHash">>;
export declare const updateOrganiser: (id: string, input: UpdateOrganiserInput) => Promise<Omit<import("../models/Organiser.model").IOrganiser, "passwordHash">>;
export {};
//# sourceMappingURL=organiser.service.d.ts.map