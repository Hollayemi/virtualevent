import mongoose, { Schema, Document, Model, Types, ClientSession } from 'mongoose';
import { AppError } from '../middleware/error';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IWallet {
    userId: Types.ObjectId;
    balance: number;        // current spendable credits
    totalEarned: number;    // lifetime credits earned (purchases + rewards + cashback)
    totalSpent: number;     // lifetime credits spent on requests
    createdAt: Date;
    updatedAt: Date;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface IWalletDocument extends IWallet, Document {
    credit(amount: number, session?: ClientSession): Promise<IWalletDocument>;
    debit(amount: number, session?: ClientSession): Promise<IWalletDocument>;
    hasSufficientBalance(amount: number): boolean;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface IWalletModel extends Model<IWalletDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const WalletSchema = new Schema<IWalletDocument, IWalletModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        balance: {
            type: Number,
            default: 0,
            min: [0, 'Wallet balance cannot be negative'],
        },
        totalEarned: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

WalletSchema.index({ userId: 1 }, { unique: true });

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Credit the wallet — increments balance and totalEarned.
 * Participates in a Mongoose session if provided.
 */
WalletSchema.methods.credit = async function (
    amount: number,
    session?: ClientSession,
): Promise<IWalletDocument> {
    if (amount <= 0) {
        throw new AppError('Credit amount must be greater than zero', 400);
    }

    this.balance += amount;
    this.totalEarned += amount;

    return session ? this.save({ session }) : this.save();
};

/**
 * Debit the wallet — decrements balance and increments totalSpent.
 * Throws AppError(400) if balance is insufficient.
 * Participates in a Mongoose session if provided.
 */
WalletSchema.methods.debit = async function (
    amount: number,
    session?: ClientSession,
): Promise<IWalletDocument> {
    if (amount <= 0) {
        throw new AppError('Debit amount must be greater than zero', 400);
    }

    if (this.balance < amount) {
        throw new AppError(
            `Insufficient credits. You have ${this.balance} credit(s) but need ${amount}.`,
            400,
        );
    }

    this.balance -= amount;
    this.totalSpent += amount;

    return session ? this.save({ session }) : this.save();
};

/**
 * Non-mutating balance check — use before attempting a debit.
 */
WalletSchema.methods.hasSufficientBalance = function (amount: number): boolean {
    return this.balance >= amount;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Wallet = mongoose.model<IWalletDocument, IWalletModel>('Wallet', WalletSchema);

export default Wallet;
