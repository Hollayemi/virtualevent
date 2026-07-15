import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createEventSchema,
    updateEventSchema,
} from '../helpers/validation.schemas';

const router = Router();

router.use(protect, requireAccountType('user'));

// Organiser's own events
router.get('/events/', eventController.getMyEvents);
router.get('/events/attendees', eventController.getEventAttendees);
router.get('/events/:eventId', eventController.getEventById);


router.post('/events/', validate(createEventSchema), eventController.createEvent,);

router.patch('/events/:eventId', validate(updateEventSchema), eventController.updateEvent,);

router.patch('/events/:eventId/publish', eventController.publishEvent,);


export default router;
