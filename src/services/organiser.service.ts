import Organiser from '../models/Organiser.model';
import { hashPassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/error';

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

export const registerOrganiser = async (input: RegisterOrganiserInput) => {
    const existing = await Organiser.findOne({ email: input.email.toLowerCase() });
    if (existing) {
        throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const passwordHash = await hashPassword(input.password);

    const organiser = await Organiser.create({
        ...input,
        email: input.email.toLowerCase(),
        passwordHash,
    });

    const token = signToken({ id: organiser.id, accountType: 'organiser' });

    return { organiser: organiser.getPublicProfile(), token };
};

export const loginOrganiser = async (email: string, password: string) => {
    const organiser = await Organiser.findByEmail(email);

    if (!organiser) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const isMatch = await organiser.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = signToken({ id: organiser.id, accountType: 'organiser' });

    return { organiser: organiser.getPublicProfile(), token };
};

export const getOrganiserById = async (id: string) => {
    const organiser = await Organiser.findById(id);
    if (!organiser) {
        throw new AppError('Organiser not found', 404, 'NOT_FOUND');
    }
    return organiser.getPublicProfile();
};

export const updateOrganiser = async (id: string, input: UpdateOrganiserInput) => {
    const organiser = await Organiser.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
    );

    if (!organiser) {
        throw new AppError('Organiser not found', 404, 'NOT_FOUND');
    }

    return organiser.getPublicProfile();
};
