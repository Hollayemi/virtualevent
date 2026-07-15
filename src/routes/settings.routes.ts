import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    updateAccountSchema,
    updateNotificationsSchema,
    enableOrganizerRoleSchema,
    switchActiveRoleSchema,
    deleteAccountSchema,
} from '../helpers/validation.schemas';

const router = Router();

router.use(protect, requireAccountType('user'));

router.get('/', settingsController.getSettings);
router.patch('/account', validate(updateAccountSchema), settingsController.updateAccount);
router.patch('/notifications', validate(updateNotificationsSchema), settingsController.updateNotifications);
router.post('/roles/organizer', validate(enableOrganizerRoleSchema), settingsController.enableOrganizerRole);
router.patch('/roles/active', validate(switchActiveRoleSchema), settingsController.switchActiveRole);
router.delete('/account', validate(deleteAccountSchema), settingsController.deleteAccount);

export default router;
