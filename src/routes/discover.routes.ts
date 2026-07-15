import { Router } from 'express';
import * as discoverController from '../controllers/discover.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { discoverConnectSchema } from '../helpers/validation.schemas';

const router = Router();

router.use(protect, requireAccountType('user'));

router.get('/attendees', discoverController.discoverAttendees);
router.get('/suggested', discoverController.getSuggestedAttendees);
router.get('/filters', discoverController.getDiscoverFilters);
router.get('/attendees/:userId', discoverController.getAttendeeDetail);

router.post(
    '/attendees/:userId/connect',
    validate(discoverConnectSchema),
    discoverController.connectFromDiscover,
);

export default router;
