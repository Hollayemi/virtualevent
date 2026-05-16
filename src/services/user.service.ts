import User, { IUserDocument } from '../models/User.model';
import { hashPassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/error';

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

export const registerUser = async (input: RegisterUserInput) => {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
        throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
        ...input,
        email: input.email.toLowerCase(),
        passwordHash,
    });

    const token = signToken({ id: user.id, accountType: 'user' });

    return { user: user.getPublicProfile(), token };
};

export const loginUser = async (email: string, password: string) => {
    const user = await User.findByEmail(email);

    if (!user) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = signToken({ id: user.id, accountType: 'user' });

    return { user: user.getPublicProfile(), token };
};

export const getUserById = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user.getPublicProfile();
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
    // Deny password changes through this route
    const user = await User.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
    );

    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user.getPublicProfile();
};
