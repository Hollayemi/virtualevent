import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as organiserService from '../services/organiser.service';
import { attachCookie } from '../utils/jwt';

export const registerOrganiser = asyncHandler(async (req: Request, res: Response) => {
    const { organiser, token } = await organiserService.registerOrganiser(req.body);
    attachCookie(res, token);
    (res as AppResponse).data({ organiser, token }, 'Organiser account created', 201);
});

export const loginOrganiser = asyncHandler(async (req: Request, res: Response) => {
    const { organiser, token } = await organiserService.loginOrganiser(
        req.body.email,
        req.body.password,
    );
    attachCookie(res, token);
    (res as AppResponse).data({ organiser, token }, 'Login successful');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const organiser = await organiserService.getOrganiserById(req.user!.id);
    (res as AppResponse).data({ organiser }, 'Profile retrieved');
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const organiser = await organiserService.updateOrganiser(req.user!.id, req.body);
    (res as AppResponse).data({ organiser }, 'Profile updated');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    (res as AppResponse).success('Logged out successfully');
});
