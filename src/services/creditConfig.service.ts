import CreditConfig, { ICreditConfigDocument } from '../models/CreditConfig.model';

interface UpsertConfigInput {
    cashbackRatio: number;
    registrationRewardAmount: number;
    referralRewardAmount: number;
    vipRequestCost: number;
}

const DEFAULT_CONFIG: UpsertConfigInput = {
    cashbackRatio: 0.33,
    registrationRewardAmount: 0,
    referralRewardAmount: 0,
    vipRequestCost: 3,
};

/**
 * Returns the singleton config document.
 * If none exists yet (first boot), returns an in-memory default object
 * so callers always get a usable value without needing to upsert first.
 */
export const getConfig = async (): Promise<ICreditConfigDocument> => {
    const config = await CreditConfig.findOne();

    if (!config) {
        // Bootstrap the singleton on first read
        return CreditConfig.create(DEFAULT_CONFIG);
    }

    return config;
};

/**
 * Admin-only — replace the entire config.
 * Uses findOneAndUpdate with upsert:true so this is always safe to call
 * even before the singleton exists.
 */
export const upsertConfig = async (
    input: UpsertConfigInput,
    adminId = 'admin',
): Promise<ICreditConfigDocument> => {
    const config = await CreditConfig.findOneAndUpdate(
        {},   // match the singleton (no filter — there's only one)
        {
            $set: {
                ...input,
                updatedBy: adminId,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        },
    );

    return config!;
};
