import { Router } from 'express';
import * as creditConfigController from '../controllers/creditConfig.controller';
import { adminKey } from '../middleware/adminKey';
import { validate } from '../middleware/validate';
import { upsertCreditConfigSchema } from '../helpers/credit.validation.schemas';

const router = Router();

// All config routes are admin-only
router.use(adminKey);

router.get('/', creditConfigController.getConfig);

router.put(
    '/',
    validate(upsertCreditConfigSchema),
    creditConfigController.upsertConfig,
);

export default router;
