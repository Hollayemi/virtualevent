import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as registrationService from '../services/registration.service';

export const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
    const registration = await registrationService.registerForEvent({
        userId: req.user!.id,
        eventId: req.params.eventId,
        ...req.body,
    });
    (res as AppResponse).data({ registration }, 'Successfully registered for event', 201);
});

export const getEventRegistrations = asyncHandler(async (req: Request, res: Response) => {
    const registrations = await registrationService.getEventRegistrations(
        req.params.eventId,
        req.user!.id,
    );
    (res as AppResponse).data({ registrations }, 'Registrations retrieved');
});

export const getMyRegistrations = asyncHandler(async (req: Request, res: Response) => {
    const registrations = await registrationService.getUserRegistrations(req.user!.id);
    (res as AppResponse).data({ registrations }, 'Your registrations retrieved');
});

export const cancelRegistration = asyncHandler(async (req: Request, res: Response) => {
    const registration = await registrationService.cancelRegistration(
        req.user!.id,
        req.params.registrationId,
    );
    (res as AppResponse).data({ registration }, 'Registration cancelled');
});
