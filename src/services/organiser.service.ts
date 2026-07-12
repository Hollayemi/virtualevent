import Organiser from '../models/Organiser.model';
import { AppError } from '../middleware/error';

interface UpdateOrganiserInput {
    name?: string;
    organisationName?: string;
    organisationDescription?: string;
    logoUrl?: string;
    website?: string;
    phone?: string;
}


export const getOrganiserById = async (id: string) => {
    const organiser = await Organiser.findById(id).select('-passwordHash').populate('userId');
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
