import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as settingsService from '../services/settings.service';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getSettings(req.user!.id);
    (res as AppResponse).data(settings, 'Settings retrieved');
});

export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.updateAccount(req.user!.id, req.body);
    (res as AppResponse).data(result, 'Account updated');
});

export const updateNotifications = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.updateNotifications(req.user!.id, req.body);
    (res as AppResponse).data(result, 'Notification preferences updated');
});

export const enableOrganizerRole = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.enableOrganizerRole(req.user!.id, req.body);
    (res as AppResponse).data(result, 'Organizer role enabled', 201);
});

export const switchActiveRole = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.switchActiveRole(req.user!.id, req.body.role);
    (res as AppResponse).data(result, 'Active role switched');
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.deleteAccount(req.user!.id, req.body);
    (res as AppResponse).data(result, 'Account scheduled for deletion');
});
