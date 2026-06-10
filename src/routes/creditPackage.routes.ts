import { Router } from 'express';
import * as creditPackageController from '../controllers/creditPackage.controller';
import { adminKey } from '../middleware/adminKey';
import { validate } from '../middleware/validate';
import {
    createCreditPackageSchema,
    updateCreditPackageSchema,
} from '../helpers/credit.validation.schemas';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

// Anyone can view active packages (shown on pricing/wallet pages)
router.get('/', creditPackageController.getActivePackages);

// ─── Admin only ───────────────────────────────────────────────────────────────

router.get('/all', adminKey, creditPackageController.getAllPackages);

router.post(
    '/',
    adminKey,
    validate(createCreditPackageSchema),
    creditPackageController.createPackage,
);

router.patch(
    '/:id',
    adminKey,
    validate(updateCreditPackageSchema),
    creditPackageController.updatePackage,
);

// Soft delete (sets isActive = false)
router.delete('/:id', adminKey, creditPackageController.deactivatePackage);

export default router;
