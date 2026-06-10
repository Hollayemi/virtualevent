import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICreditConfig {
    /**
     * Fraction of spent credits the VIP receives as cashback.
     * e.g. 0.33 → user spends 3 credits, VIP earns Math.floor(3 × 0.33) = 1 credit.
     * Range: 0–1 (0 = no cashback, 1 = full refund to VIP)
     */
    cashbackRatio: number;

    /**
     * Credits awarded to a user upon confirmed event registration.
     * 0 = disabled.
     */
    registrationRewardAmount: number;

    /**
     * Credits awarded to a referrer when their referred user
     * completes their FIRST confirmed event registration.
     * 0 = disabled.
     */
    referralRewardAmount: number;

    /**
     * Default credit cost for a lower-tier user to send a connection
     * request to a VIP-protected attendee.
     */
    vipRequestCost: number;

    updatedBy?: string;   // admin identifier who last changed config
    updatedAt: Date;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface ICreditConfigDocument extends ICreditConfig, Document {
    getCashbackAmount(spentCredits: number): number;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ICreditConfigModel extends Model<ICreditConfigDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CreditConfigSchema = new Schema<ICreditConfigDocument, ICreditConfigModel>(
    {
        cashbackRatio: {
            type: Number,
            required: [true, 'Cashback ratio is required'],
            min: [0, 'Cashback ratio cannot be less than 0'],
            max: [1, 'Cashback ratio cannot exceed 1'],
            default: 0.33,
        },
        registrationRewardAmount: {
            type: Number,
            required: true,
            min: [0, 'Registration reward cannot be negative'],
            default: 0,
        },
        referralRewardAmount: {
            type: Number,
            required: true,
            min: [0, 'Referral reward cannot be negative'],
            default: 0,
        },
        vipRequestCost: {
            type: Number,
            required: [true, 'VIP request cost is required'],
            min: [1, 'VIP request cost must be at least 1 credit'],
            default: 3,
        },
        updatedBy: {
            type: String,
            default: null,
        },
    },
    {
        // Only one document ever exists — use upsert in the service, never create()
        // No updatedAt auto-manage; we set it manually on upsert so we can track it
        timestamps: { createdAt: true, updatedAt: true },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Calculate the cashback a VIP receives when they accept a request.
 * Always floors to avoid fractional credits.
 */
CreditConfigSchema.methods.getCashbackAmount = function (spentCredits: number): number {
    if (spentCredits <= 0 || this.cashbackRatio <= 0) return 0;
    return Math.floor(spentCredits * this.cashbackRatio);
};

// ─── Model ────────────────────────────────────────────────────────────────────

const CreditConfig = mongoose.model<ICreditConfigDocument, ICreditConfigModel>(
    'CreditConfig',
    CreditConfigSchema,
);

export default CreditConfig;
