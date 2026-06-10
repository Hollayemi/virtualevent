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

export default router;
