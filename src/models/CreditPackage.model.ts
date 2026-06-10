import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICreditPackage {
    name: string;
    description?: string;
    credits: number;          // credits the user receives on purchase
    price: number;            // price in base currency
    currency: string;
    isActive: boolean;        // soft disable — never hard delete
    isPopular: boolean;       // UI badge hint ("Most Popular")
    sortOrder: number;        // display ordering
    createdBy: string;        // admin identifier (simple string for M2; full admin auth later)
    createdAt: Date;
    updatedAt: Date;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface ICreditPackageDocument extends ICreditPackage, Document {}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ICreditPackageModel extends Model<ICreditPackageDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CreditPackageSchema = new Schema<ICreditPackageDocument, ICreditPackageModel>(
    {
        name: {
            type: String,
            required: [true, 'Package name is required'],
            trim: true,
            maxlength: [60, 'Package name cannot exceed 60 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        credits: {
            type: Number,
            required: [true, 'Credit amount is required'],
            min: [1, 'Package must contain at least 1 credit'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        currency: {
            type: String,
            default: 'NGN',
            uppercase: true,
            trim: true,
            maxlength: [10, 'Currency code cannot exceed 10 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        sortOrder: {
            type: Number,
            default: 0,
            min: 0,
        },
        createdBy: {
            type: String,
            required: [true, 'Creator identifier is required'],
            default: 'admin',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

CreditPackageSchema.index({ isActive: 1, sortOrder: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const CreditPackage = mongoose.model<ICreditPackageDocument, ICreditPackageModel>(
    'CreditPackage',
    CreditPackageSchema,
);

export default CreditPackage;
