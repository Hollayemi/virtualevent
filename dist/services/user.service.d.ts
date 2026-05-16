interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    bio?: string;
    role?: string;
    company?: string;
    industry?: string;
    interests?: string[];
    networkingGoals?: string;
}
interface UpdateUserInput {
    name?: string;
    phone?: string;
    bio?: string;
    role?: string;
    company?: string;
    industry?: string;
    interests?: string[];
    networkingGoals?: string;
    avatarUrl?: string;
}
export declare const registerUser: (input: RegisterUserInput) => Promise<{
    user: Omit<import("../models/User.model").IUser, "passwordHash">;
    token: string;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    user: Omit<import("../models/User.model").IUser, "passwordHash">;
    token: string;
}>;
export declare const getUserById: (id: string) => Promise<Omit<import("../models/User.model").IUser, "passwordHash">>;
export declare const updateUser: (id: string, input: UpdateUserInput) => Promise<Omit<import("../models/User.model").IUser, "passwordHash">>;
export {};
//# sourceMappingURL=user.service.d.ts.map