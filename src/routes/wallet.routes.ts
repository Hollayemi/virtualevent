import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { initiatePurchaseSchema } from '../helpers/credit.validation.schemas';

const router = Router();

// ─── User wallet (protected) ──────────────────────────────────────────────────

router.get(
    '/me',
    protect,
    requireAccountType('user'),
    walletController.getMyWallet,
);

router.get(
    '/me/transactions',
    protect,
    requireAccountType('user'),
    walletController.getMyTransactions,
);

router.post(
    '/purchase/initiate',
    protect,
    requireAccountType('user'),
    validate(initiatePurchaseSchema),
    walletController.initiatePurchase,
);

// ─── Payment gateway webhook (public — authenticated by gateway signature) ────

router.post('/purchase/callback', walletController.purchaseCallback);

// ─── wallet.slice.ts flat surface (protected) ─────────────────────────────────

router.get('/balance', protect, requireAccountType('user'), walletController.getWalletBalance);
router.get('/transactions', protect, requireAccountType('user'), walletController.listTransactions);
router.get('/packages', protect, requireAccountType('user'), walletController.getWalletCreditPackages);
router.post('/purchase', protect, requireAccountType('user'), walletController.purchaseCredits);
router.get('/pending-cashback', protect, requireAccountType('user'), walletController.getPendingCashback);

export default router;
