import mongoose, { ClientSession } from 'mongoose';
import Wallet, { IWalletDocument } from '../models/Wallet.model';
import CreditTransaction, { TransactionType, TransactionReferenceModel } from '../models/CreditTransaction.model';
import CreditPackage from '../models/CreditPackage.model';
import { AppError } from '../middleware/error';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WriteTransactionInput {
    userId: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    referenceId?: string;
    referenceModel?: TransactionReferenceModel;
    metadata?: Record<string, any>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Internal helper — writes a CreditTransaction record.
 * Always called immediately after a wallet.credit() or wallet.debit() call,
 * within the same session so both writes are atomic.
 */
const writeTransaction = async (
    input: WriteTransactionInput,
    session?: ClientSession,
): Promise<void> => {
    const doc = new CreditTransaction({
        userId: input.userId,
        type: input.type,
        amount: input.amount,
        balanceBefore: input.balanceBefore,
        balanceAfter: input.balanceAfter,
        description: input.description,
        referenceId: input.referenceId ?? null,
        referenceModel: input.referenceModel ?? null,
        metadata: input.metadata ?? null,
    });

    await (session ? doc.save({ session }) : doc.save());
};

// ─── Core Wallet Operations ───────────────────────────────────────────────────

/**
 * Find wallet by userId or create one if it doesn't exist.
 * Called automatically in user.service.ts → registerUser.
 */
export const getOrCreateWallet = async (userId: string): Promise<IWalletDocument> => {
    const existing = await Wallet.findOne({ userId });
    if (existing) return existing;
    return Wallet.create({ userId });
};

export const getWalletByUserId = async (userId: string): Promise<IWalletDocument> => {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw new AppError('Wallet not found for this user', 404, 'NOT_FOUND');
    }
    return wallet;
};

/**
 * Credit a user's wallet and write the corresponding transaction record.
 * Wraps both writes in a session when provided.
 */
export const creditWallet = async (
    userId: string,
    amount: number,
    txData: Pick<WriteTransactionInput, 'type' | 'description' | 'referenceId' | 'referenceModel' | 'metadata'>,
    session?: ClientSession,
): Promise<IWalletDocument> => {
    const wallet = await Wallet.findOne({ userId }).session(session ?? null);
    if (!wallet) throw new AppError('Wallet not found', 404, 'NOT_FOUND');

    const balanceBefore = wallet.balance;
    await wallet.credit(amount, session);
    const balanceAfter = wallet.balance;

    await writeTransaction(
        {
            userId,
            amount,
            balanceBefore,
            balanceAfter,
            type: txData.type,
            description: txData.description,
            referenceId: txData.referenceId,
            referenceModel: txData.referenceModel,
            metadata: txData.metadata,
        },
        session,
    );

    return wallet;
};

/**
 * Debit a user's wallet and write the corresponding transaction record.
 * wallet.debit() throws AppError(400) if balance is insufficient —
 * that error propagates up naturally.
 */
export const debitWallet = async (
    userId: string,
    amount: number,
    txData: Pick<WriteTransactionInput, 'type' | 'description' | 'referenceId' | 'referenceModel' | 'metadata'>,
    session?: ClientSession,
): Promise<IWalletDocument> => {
    const wallet = await Wallet.findOne({ userId }).session(session ?? null);
    if (!wallet) throw new AppError('Wallet not found', 404, 'NOT_FOUND');

    const balanceBefore = wallet.balance;
    await wallet.debit(amount, session);   // throws if insufficient
    const balanceAfter = wallet.balance;

    await writeTransaction(
        {
            userId,
            amount,
            balanceBefore,
            balanceAfter,
            type: txData.type,
            description: txData.description,
            referenceId: txData.referenceId,
            referenceModel: txData.referenceModel,
            metadata: txData.metadata,
        },
        session,
    );

    return wallet;
};

// ─── Reads ────────────────────────────────────────────────────────────────────

export const getUserTransactions = async (
    userId: string,
    page = 1,
    limit = 20,
) => {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        CreditTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        CreditTransaction.countDocuments({ userId }),
    ]);

    return {
        transactions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ─── Purchase Flow ────────────────────────────────────────────────────────────

/**
 * Validates the package and delegates to the caller's payment initializer.
 * Returns raw payment init data — the payment initializer is already wired
 * in the project; this service just loads and validates the package first.
 */
export const validatePackageForPurchase = async (packageId: string) => {
    const pkg = await CreditPackage.findById(packageId);

    if (!pkg) {
        throw new AppError('Credit package not found', 404, 'NOT_FOUND');
    }

    if (!pkg.isActive) {
        throw new AppError('This credit package is no longer available', 400);
    }

    return pkg;
};

/**
 * Payment gateway webhook handler — confirms purchase and credits wallet.
 * Call this after your existing payment library verifies the signature.
 *
 * @param userId    - pulled from payment metadata at initialization time
 * @param packageId - pulled from payment metadata at initialization time
 * @param paymentRef - gateway reference for the metadata record
 */
export const confirmCreditPurchase = async (
    userId: string,
    packageId: string,
    paymentRef: string,
): Promise<IWalletDocument> => {
    const pkg = await CreditPackage.findById(packageId);

    if (!pkg) {
        throw new AppError(`Credit package ${packageId} not found during purchase confirmation`, 404);
    }

    if (!pkg.isActive) {
        // Package was deactivated between init and callback — still honour the purchase
        // (user already paid). Log and proceed.
        console.warn(`[wallet.service] Package ${packageId} is inactive but purchase confirmed — crediting anyway.`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const wallet = await creditWallet(
            userId,
            pkg.credits,
            {
                type: 'purchase',
                description: `Purchased ${pkg.name} — ${pkg.credits} credit${pkg.credits !== 1 ? 's' : ''}`,
                referenceId: packageId,
                referenceModel: 'CreditPackage',
                metadata: { paymentRef, packageName: pkg.name },
            },
            session,
        );

        await session.commitTransaction();
        return wallet;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};
