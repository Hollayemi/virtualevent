import { Request, Response } from 'express';
import { asyncHandler, AppResponse, AppError } from '../middleware/error';
import * as walletService from '../services/wallet.service';
import { confirmCreditPurchase, validatePackageForPurchase } from '../services/wallet.service';

// ─── User: own wallet ─────────────────────────────────────────────────────────

export const getMyWallet = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await walletService.getWalletByUserId(req.user!.id);
    (res as AppResponse).data({ wallet }, 'Wallet retrieved');
});

export const getMyTransactions = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await walletService.getUserTransactions(req.user!.id, page, limit);
    (res as AppResponse).data(result, 'Transaction history retrieved');
});

// ─── Purchase: initiate ───────────────────────────────────────────────────────

/**
 * Validates the package, then hands off to your existing payment initializer.
 * Wire your payment init call below where indicated.
 */
export const initiatePurchase = asyncHandler(async (req: Request, res: Response) => {
    const { packageId } = req.body;

    const pkg = await validatePackageForPurchase(packageId);

    // ── Wire your existing payment initializer here ──────────────────────────
    // Example (replace with your actual payment library call):
    //
    // const paymentData = await yourPaymentLib.initializeTransaction({
    //     amount: pkg.price,
    //     currency: pkg.currency,
    //     email: req.user!.email,           // you may need to fetch user for email
    //     metadata: {
    //         userId: req.user!.id,
    //         packageId: pkg._id.toString(),
    //     },
    //     callback_url: `${process.env.CLIENT_URL}/wallet/callback`,
    // });
    //
    // return (res as AppResponse).data({ paymentData }, 'Payment initialized');
    // ─────────────────────────────────────────────────────────────────────────

    // Placeholder response until payment lib is wired:
    (res as AppResponse).data(
        {
            package: {
                id: pkg._id,
                name: pkg.name,
                credits: pkg.credits,
                price: pkg.price,
                currency: pkg.currency,
            },
            meta: {
                userId: req.user!.id,
                packageId: pkg._id.toString(),
                note: 'Wire your payment initializer here in wallet.controller.ts',
            },
        },
        'Package validated — connect your payment initializer',
    );
});

// ─── Purchase: webhook callback ───────────────────────────────────────────────

/**
 * Payment gateway webhook. Called by the gateway after a successful payment.
 *
 * Security: verify the gateway signature BEFORE calling confirmCreditPurchase.
 * Wire your existing signature verification below.
 *
 * This route is public (no protect middleware) — authentication comes from
 * the gateway signature, not a user JWT.
 */
export const purchaseCallback = asyncHandler(async (req: Request, res: Response) => {
    // ── Wire your gateway signature verification here ────────────────────────
    // Example (replace with your actual verification):
    //
    // const signature = req.headers['x-paystack-signature'] as string;
    // const isValid = yourPaymentLib.verifySignature(
    //     JSON.stringify(req.body),
    //     signature,
    //     process.env.PAYMENT_WEBHOOK_SECRET!,
    // );
    //
    // if (!isValid) {
    //     return (res as AppResponse).errorMessage('Invalid webhook signature', 401);
    // }
    // ─────────────────────────────────────────────────────────────────────────

    const { event, data } = req.body;

    // Only handle successful payment events (adjust event name to match your gateway)
    if (event !== 'charge.success' && event !== 'payment.success') {
        // Return 200 to acknowledge receipt without processing
        return (res as AppResponse).success('Webhook received');
    }

    const { userId, packageId } = data?.metadata ?? {};
    const paymentRef = data?.reference ?? data?.id ?? 'unknown';

    if (!userId || !packageId) {
        // Metadata missing — log and return 200 to stop gateway retries
        console.error('[wallet.callback] Missing userId or packageId in payment metadata', data);
        return (res as AppResponse).success('Webhook received');
    }

    try {
        await confirmCreditPurchase(userId, packageId, paymentRef);
    } catch (err: any) {
        // Log the error but return 200 — prevents gateway from retrying
        // and causing duplicate credits
        console.error('[wallet.callback] confirmCreditPurchase failed:', err.message, {
            userId,
            packageId,
            paymentRef,
        });
    }

    (res as AppResponse).success('Webhook processed');
});
