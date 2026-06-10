import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    registerUserSchema,
    loginSchema,
    updateUserSchema,
} from '../helpers/validation.schemas';

const router = Router();

// Public
router.post('/register', validate(registerUserSchema), userController.registerUser);
router.post('/login', validate(loginSchema), userController.loginUser);

// Protected — user only
router.use(protect, requireAccountType('user'));

router.get('/me', userController.getMe);
router.patch('/me/vip-protection', userController.vipProtectionHandler);
router.patch('/me', validate(updateUserSchema), userController.updateMe);
router.post('/logout', userController.logout);

export default router;
