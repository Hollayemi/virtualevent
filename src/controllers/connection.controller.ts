import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as connectionService from '../services/connection.service';

export const sendConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
    const connection = await connectionService.sendConnectionRequest({
        requesterId: req.user!.id,
        eventId: req.params.eventId,
        ...req.body,
    });
    (res as AppResponse).data({ connection }, 'Connection request sent', 201);
});

export const getEventConnections = asyncHandler(async (req: Request, res: Response) => {
    const connections = await connectionService.getEventConnections(
        req.user!.id,
        req.params.eventId,
    );
    (res as AppResponse).data({ connections }, 'Connections retrieved');
});

export const respondToConnection = asyncHandler(async (req: Request, res: Response) => {
    const connection = await connectionService.respondToConnection(
        req.user!.id,
        req.params.connectionId,
        req.body.action,
    );
    (res as AppResponse).data({ connection }, `Connection request ${req.body.action}ed`);
});

export const browseAttendeesInTier = asyncHandler(async (req: Request, res: Response) => {
    const attendees = await connectionService.browseAttendeesInTier(
        req.user!.id,
        req.params.eventId,
    );
    (res as AppResponse).data({ attendees }, 'Attendees retrieved');
});
