import { Router } from 'express';
import * as registrationController from '../controllers/registration.controller';
import { protect, requireAccountType } from '../middleware/auth';

const router = Router();

// User views all their registrations across events
router.get(
    '/',
    protect,
    requireAccountType('user'),
    registrationController.getMyRegistrations,
);

// User cancels a specific registration
router.patch(
    '/:registrationId/cancel',
    protect,
    requireAccountType('user'),
    registrationController.cancelRegistration,
);

export default router;
