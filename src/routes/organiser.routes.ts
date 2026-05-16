import { Router } from 'express';
import * as organiserController from '../controllers/organiser.controller';
import * as eventController from '../controllers/event.controller';
import * as registrationController from '../controllers/registration.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    registerOrganiserSchema,
    loginSchema,
    updateOrganiserSchema,
    createEventSchema,
    updateEventSchema,
} from '../helpers/validation.schemas';

const router = Router();

// Public
router.post('/register', validate(registerOrganiserSchema), organiserController.registerOrganiser);
router.post('/login', validate(loginSchema), organiserController.loginOrganiser);

// Protected — organiser only
router.use(protect, requireAccountType('organiser'));

router.get('/me', organiserController.getMe);
router.patch('/me', validate(updateOrganiserSchema), organiserController.updateMe);
router.post('/logout', organiserController.logout);

// Organiser's own events
router.get('/me/events', eventController.getMyEvents);

export default router;
