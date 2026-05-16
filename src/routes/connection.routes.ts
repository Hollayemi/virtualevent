import { Router } from 'express';
import * as connectionController from '../controllers/connection.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { respondConnectionSchema } from '../helpers/validation.schemas';

const router = Router();

// Respond to a specific connection request (accept / decline)
router.patch(
    '/:connectionId/respond',
    protect,
    requireAccountType('user'),
    validate(respondConnectionSchema),
    connectionController.respondToConnection,
);

export default router;
