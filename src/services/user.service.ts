import Organiser from '../models/Organiser.model';
import User from '../models/User.model';
import Attendee from '../models/Attendee.model';
import { hashPassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/error';

interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    accountType: 'attendee' | 'organiser';
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
    accountType?: string;
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

    const { accountType } = input;

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
        ...input,
        email: input.email.toLowerCase(),
        passwordHash,
    });

    if (accountType === 'attendee') {
        const attendee = await Attendee.create({
            userId: user._id,
            ...input,
            avatarUrl: '',
            isVerified: false,
            vipProtectionEnabled: false,
        });
        user.attendeeProfile = attendee._id
        user.save();

    } else if (accountType === 'organiser') {
        const organiser = await Organiser.create({
            ...input,
            userId: user._id,
            isVerified: false,
        });
        user.organiserProfile = organiser._id
        user.save();
    }


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
    const user = await User.findById(id).select('-password').populate("attendeeProfile").populate("organiserProfile");
    console.log('user', user);
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

export const vipProtection = async (id: string, enable: boolean) => {
    const user = await User.findByIdAndUpdate(
        id,
        { $set: { vipProtectionEnabled: Boolean(enable) } },
        { new: true, runValidators: true },
    );

    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user.getPublicProfile();
};

