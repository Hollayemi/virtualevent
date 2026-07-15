import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import * as registrationController from '../controllers/registration.controller';
import * as connectionController from '../controllers/connection.controller';
import { protect, requireAccountType, ifToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createEventSchema,
    updateEventSchema,
    registerForEventSchema,
    sendConnectionSchema,
    respondConnectionSchema,
} from '../helpers/validation.schemas';

const router = Router();

//  Public Event Routes 

router.get('/', ifToken, eventController.getEvents);
router.get('/:eventId', ifToken, eventController.getEventById);

//  Organiser-only Event Management 

//  Registrations 

// User registers for an event
router.post(
    '/:eventId/register',
    protect,
    requireAccountType('user'),
    validate(registerForEventSchema),
    registrationController.registerForEvent,
);

// Organiser views all registrations for their event
router.get(
    '/:eventId/registrations',
    protect,
    requireAccountType('organiser'),
    registrationController.getEventRegistrations,
);

//  Connections (user-only, must be confirmed attendee) 

router.post(
    '/:eventId/connections',
    protect,
    requireAccountType('user'),
    validate(sendConnectionSchema),
    connectionController.sendConnectionRequest,
);

router.get(
    '/:eventId/connections',
    protect,
    requireAccountType('user'),
    connectionController.getEventConnections,
);

router.get(
    '/:eventId/attendees',
    protect,
    requireAccountType('user'),
    connectionController.browseAttendeesInTier,
);

export default router;
