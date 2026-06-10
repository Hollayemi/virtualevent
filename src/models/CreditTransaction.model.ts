import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { AppError } from '../middleware/error';

// ─── Constants ────────────────────────────────────────────────────────────────

export const TRANSACTION_TYPES = [
    'purchase',   // user bought a credit package
    'spend',      // user spent credits on a VIP connection request
    'earn',       // user earned credits (registration reward, referral reward)
    'cashback',   // VIP received cashback from an accepted request
    'refund',     // reserved for future use — credits returned to user
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_REFERENCE_MODELS = [
    'CreditPackage',
    'Connection',
    'Registration',
] as const;

export type TransactionReferenceModel = (typeof TRANSACTION_REFERENCE_MODELS)[number];

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICreditTransaction {
    userId: Types.ObjectId;
    type: TransactionType;
    amount: number;                          // always positive — direction implied by type
    balanceBefore: number;                   // wallet balance before this transaction
    balanceAfter: number;                    // wallet balance after this transaction
    description: string;                     // human-readable note
    referenceId?: string;                    // linked document ID for auditability
    referenceModel?: TransactionReferenceModel;
    metadata?: Record<string, any>;          // flexible extra data
    createdAt: Date;
    // No updatedAt — this collection is append-only / immutable
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface ICreditTransactionDocument extends ICreditTransaction, Document {}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ICreditTransactionModel extends Model<ICreditTransactionDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CreditTransactionSchema = new Schema<ICreditTransactionDocument, ICreditTransactionModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        type: {
            type: String,
            enum: TRANSACTION_TYPES,
            required: [true, 'Transaction type is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Transaction amount is required'],
            min: [1, 'Transaction amount must be at least 1'],
        },
        balanceBefore: {
            type: Number,
            required: [true, 'Balance before is required'],
            min: 0,
        },
        balanceAfter: {
            type: Number,
            required: [true, 'Balance after is required'],
            min: 0,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
        referenceId: {
            type: String,
            default: null,
        },
        referenceModel: {
            type: String,
            enum: TRANSACTION_REFERENCE_MODELS,
            default: null,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        // Only createdAt — no updatedAt, records are immutable
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1 });
CreditTransactionSchema.index({ referenceId: 1 });

// ─── Guard: prevent any update operations ────────────────────────────────────
// Transactions are append-only. This hook blocks accidental updates at the
// model level in case service code ever calls save() on an existing document.

CreditTransactionSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
    throw new AppError('CreditTransaction records are immutable and cannot be updated', 500);
});

// ─── Model ────────────────────────────────────────────────────────────────────

const CreditTransaction = mongoose.model<ICreditTransactionDocument, ICreditTransactionModel>(
    'CreditTransaction',
    CreditTransactionSchema,
);

export default CreditTransaction;
