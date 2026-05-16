import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as userService from '../services/user.service';
import { attachCookie } from '../utils/jwt';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await userService.registerUser(req.body);
    attachCookie(res, token);
    (res as AppResponse).data({ user, token }, 'Account created successfully', 201);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await userService.loginUser(req.body.email, req.body.password);
    attachCookie(res, token);
    (res as AppResponse).data({ user, token }, 'Login successful');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.user!.id);
    (res as AppResponse).data({ user }, 'Profile retrieved');
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.user!.id, req.body);
    (res as AppResponse).data({ user }, 'Profile updated');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    (res as AppResponse).success('Logged out successfully');
});
