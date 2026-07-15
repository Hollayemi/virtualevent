import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../helpers/validation.schemas';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.use(protect, requireAccountType('user'));

router.get('/', profileController.getProfile);
router.patch('/', validate(updateProfileSchema), profileController.updateProfile);
router.post('/avatar', uploadAvatar, profileController.uploadAvatar);
router.get('/business-card', profileController.getBusinessCard);
router.get('/events', profileController.getUserEvents);

// Keep this LAST — otherwise it would swallow /avatar, /business-card, /events.
router.get('/:userId', profileController.getPublicProfile);

export default router;
