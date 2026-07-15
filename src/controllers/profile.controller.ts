import { Request, Response } from 'express';
import { asyncHandler, AppResponse, AppError } from '../middleware/error';
import * as profileService from '../services/profile.service';
import { env } from '../config/env';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await profileService.getProfile(req.user!.id, {
        eventId: req.query.eventId as string | undefined,
    });
    (res as AppResponse).data(profile, 'Profile retrieved');
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await profileService.getPublicProfile(req.params.userId, {
        eventId: req.query.eventId as string | undefined,
    });
    (res as AppResponse).data(profile, 'Profile retrieved');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await profileService.updateProfile(req.user!.id, req.body);
    (res as AppResponse).data(profile, 'Profile updated');
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('No avatar file was uploaded', 400);
    }

    const publicPath = `/uploads/avatars/${req.file.filename}`;
    const avatarUrl = `${env.SERVER_URL ?? ''}${publicPath}`;

    const url = await profileService.setAvatarUrl(req.user!.id, avatarUrl);
    (res as AppResponse).data({ avatarUrl: url }, 'Avatar uploaded');
});

export const getBusinessCard = asyncHandler(async (req: Request, res: Response) => {
    const card = await profileService.getBusinessCard(req.user!.id, {
        userId: req.query.userId as string | undefined,
        eventId: req.query.eventId as string | undefined,
    });
    (res as AppResponse).data(card, 'Business card retrieved');
});

export const getUserEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await profileService.getUserEvents(req.user!.id);
    (res as AppResponse).data(events, 'Events retrieved');
});
