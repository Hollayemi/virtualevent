import CreditPackage from '../models/CreditPackage.model';
import { AppError } from '../middleware/error';

interface CreatePackageInput {
    name: string;
    description?: string;
    credits: number;
    price: number;
    currency?: string;
    isPopular?: boolean;
    sortOrder?: number;
}

interface UpdatePackageInput {
    name?: string;
    description?: string;
    credits?: number;
    price?: number;
    currency?: string;
    isPopular?: boolean;
    isActive?: boolean;
    sortOrder?: number;
}

export const createPackage = async (input: CreatePackageInput, adminId = 'admin') => {
    const pkg = await CreditPackage.create({
        ...input,
        createdBy: adminId,
    });
    return pkg;
};

export const getActivePackages = async () => {
    return CreditPackage.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

export const getAllPackages = async () => {
    // Admin view — includes inactive packages
    return CreditPackage.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
};

export const getPackageById = async (id: string) => {
    const pkg = await CreditPackage.findById(id);
    if (!pkg) throw new AppError('Credit package not found', 404, 'NOT_FOUND');
    return pkg;
};

export const updatePackage = async (id: string, input: UpdatePackageInput) => {
    const pkg = await CreditPackage.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
    );

    if (!pkg) throw new AppError('Credit package not found', 404, 'NOT_FOUND');
    return pkg;
};

/**
 * Soft delete — sets isActive = false.
 * Hard delete is intentionally not exposed; existing CreditTransaction
 * records reference package IDs and must remain resolvable.
 */
export const deactivatePackage = async (id: string) => {
    const pkg = await CreditPackage.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true },
    );

    if (!pkg) throw new AppError('Credit package not found', 404, 'NOT_FOUND');
    return pkg;
};
