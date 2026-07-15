import mongoose, { ClientSession } from 'mongoose';
import Wallet, { IWalletDocument } from '../models/Wallet.model';
import CreditTransaction, {
    TransactionType,
    TransactionReferenceModel,
    TransactionSource,
} from '../models/CreditTransaction.model';
import CreditPackage from '../models/CreditPackage.model';
import Connection from '../models/Connection.model';
import { AppError } from '../middleware/error';
import { getConfig } from './creditConfig.service';

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
    source?: TransactionSource;
    eventId?: string;
    eventName?: string;
    metadata?: Record<string, any>;
}

// wallet.slice.ts TransactionKind — direction, derived from `type`.
const KIND_BY_TYPE: Record<TransactionType, 'credit' | 'debit'> = {
    purchase: 'credit',
    earn: 'credit',
    cashback: 'credit',
    refund: 'credit',
    spend: 'debit',
};

const serializeTransaction = (tx: any) => ({
    _id: tx._id,
    userId: tx.userId,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    kind: KIND_BY_TYPE[tx.type as TransactionType] ?? 'credit',
    source: tx.source ?? null,
    description: tx.description,
    referenceId: tx.referenceId ?? undefined,
    referenceType: tx.referenceModel
        ? (tx.referenceModel.toLowerCase() as 'connection' | 'purchase')
        : undefined,
    eventId: tx.eventId ?? undefined,
    eventName: tx.eventName ?? undefined,
    metadata: tx.metadata ?? undefined,
    createdAt: tx.createdAt,
});

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
        source: input.source ?? null,
        amount: input.amount,
        balanceBefore: input.balanceBefore,
        balanceAfter: input.balanceAfter,
        description: input.description,
        referenceId: input.referenceId ?? null,
        referenceModel: input.referenceModel ?? null,
        eventId: input.eventId ?? null,
        eventName: input.eventName ?? null,
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
    txData: Pick<
        WriteTransactionInput,
        'type' | 'description' | 'referenceId' | 'referenceModel' | 'source' | 'eventId' | 'eventName' | 'metadata'
    >,
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
            source: txData.source,
            eventId: txData.eventId,
            eventName: txData.eventName,
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
    txData: Pick<
        WriteTransactionInput,
        'type' | 'description' | 'referenceId' | 'referenceModel' | 'source' | 'eventId' | 'eventName' | 'metadata'
    >,
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
            source: txData.source,
            eventId: txData.eventId,
            eventName: txData.eventName,
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
                source: 'purchase',
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

// ══════════════════════════════════════════════════════════════════════════
// wallet.slice.ts — new flat wallet API surface
// (getWalletBalance / listTransactions / getCreditPackages / purchaseCredits /
// getPendingCashback). These sit alongside the legacy /me + initiate/callback
// flow above rather than replacing it, so existing integrations keep working.
// See GAP_ANALYSIS.md → "Wallet module".
// ══════════════════════════════════════════════════════════════════════════

/**
 * GET /wallet/balance — WalletBalance shape.
 * earnedThisMonth / spentThisMonth are computed from CreditTransaction for
 * the current calendar month; pendingCashback is looked up from
 * getPendingCashback() below.
 */
export const getWalletBalance = async (userId: string, eventId?: string) => {
    const wallet = await getOrCreateWallet(userId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthMatch: Record<string, any> = {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startOfMonth },
    };
    if (eventId) monthMatch.eventId = new mongoose.Types.ObjectId(eventId);

    const [monthAgg] = await CreditTransaction.aggregate([
        { $match: monthMatch },
        {
            $group: {
                _id: null,
                earned: {
                    $sum: {
                        $cond: [{ $in: ['$type', ['purchase', 'earn', 'cashback', 'refund']] }, '$amount', 0],
                    },
                },
                spent: {
                    $sum: { $cond: [{ $eq: ['$type', 'spend'] }, '$amount', 0] },
                },
            },
        },
    ]);

    const pending = await getPendingCashback(userId, eventId);

    return {
        balance: wallet.balance,
        lifetimeCredits: wallet.totalEarned,
        earnedThisMonth: monthAgg?.earned ?? 0,
        spentThisMonth: monthAgg?.spent ?? 0,
        pendingCashback: pending.total,
        currency: 'credits' as const,
    };
};

export interface ListWalletTransactionsParams {
    eventId?: string;
    kind?: 'credit' | 'debit' | 'pending' | 'all';
    source?: TransactionSource | 'all';
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}

/**
 * GET /wallet/transactions — paginated, filterable, WalletTransaction[] shape.
 * `kind` is derived from `type` (see KIND_BY_TYPE) — 'pending' never occurs
 * today since CreditTransaction is only written on settled operations, but
 * the filter is accepted for forward-compatibility.
 */
export const listTransactions = async (userId: string, params: ListWalletTransactionsParams) => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const match: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
    if (params.eventId) match.eventId = new mongoose.Types.ObjectId(params.eventId);
    if (params.source && params.source !== 'all') match.source = params.source;
    if (params.kind && params.kind !== 'all') {
        const types = (Object.keys(KIND_BY_TYPE) as TransactionType[]).filter(
            (t) => KIND_BY_TYPE[t] === params.kind,
        );
        match.type = { $in: types };
    }
    if (params.startDate || params.endDate) {
        match.createdAt = {};
        if (params.startDate) match.createdAt.$gte = new Date(params.startDate);
        if (params.endDate) match.createdAt.$lte = new Date(params.endDate);
    }

    const [docs, total] = await Promise.all([
        CreditTransaction.find(match)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        CreditTransaction.countDocuments(match),
    ]);

    return {
        data: docs.map(serializeTransaction),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

/**
 * GET /wallet/packages — wallet.slice.ts CreditPackage shape
 * (id instead of _id, `highlighted` instead of `isPopular`).
 */
export const getWalletCreditPackages = async () => {
    const packages = await CreditPackage.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    return packages.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        credits: p.credits,
        price: p.price,
        currency: (p.currency || 'USD') as 'USD',
        highlighted: p.isPopular,
        note: p.description,
    }));
};

/**
 * POST /wallet/purchase — synchronous purchase for the new wallet.slice.ts
 * contract (frontend calls this directly with a packageId, no separate
 * initiate/callback round-trip). If a real payment gateway is wired in,
 * charge `paymentMethodId` BEFORE calling this — this function assumes
 * payment has already succeeded, mirroring confirmCreditPurchase() above.
 */
export const purchaseCredits = async (
    userId: string,
    input: { packageId: string; eventId?: string; paymentMethodId?: string },
) => {
    const pkg = await validatePackageForPurchase(input.packageId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const walletBefore = await Wallet.findOne({ userId }).session(session);
        const balanceBefore = walletBefore?.balance ?? 0;

        const wallet = await creditWallet(
            userId,
            pkg.credits,
            {
                type: 'purchase',
                description: `Purchased ${pkg.name} — ${pkg.credits} credit${pkg.credits !== 1 ? 's' : ''}`,
                referenceId: pkg._id.toString(),
                referenceModel: 'CreditPackage',
                source: 'purchase',
                eventId: input.eventId,
                metadata: { paymentMethodId: input.paymentMethodId ?? null },
            },
            session,
        );

        const tx = await CreditTransaction.findOne({ userId, referenceId: pkg._id.toString() })
            .sort({ createdAt: -1 })
            .session(session);

        await session.commitTransaction();

        return {
            transactionId: tx?._id?.toString() ?? '',
            packageId: pkg._id.toString(),
            credits: pkg.credits,
            price: pkg.price,
            balanceAfter: wallet.balance,
        };
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

/**
 * GET /wallet/pending-cashback — total cashback this user (as VIP recipient)
 * stands to earn from currently *pending* connection requests, i.e. what
 * they'd receive if every pending request they were sent got accepted.
 * Actual cashback is credited on accept (see connection.service.ts).
 */
export const getPendingCashback = async (userId: string, eventId?: string) => {
    const config = await getConfig();

    const match: Record<string, any> = {
        recipientId: new mongoose.Types.ObjectId(userId),
        status: 'pending',
        creditCost: { $gt: 0 },
    };
    if (eventId) match.eventId = new mongoose.Types.ObjectId(eventId);

    const pending = await Connection.find(match).select('creditCost').lean();

    const total = pending.reduce(
        (sum, c) => sum + Math.floor((c.creditCost ?? 0) * config.cashbackRatio),
        0,
    );

    return { total, count: pending.length };
};
