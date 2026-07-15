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
    const attendees = await connectionService.browseAttendees(
        req.user!.id,
        req.params.eventId,
        req.query.inTier === "true",
    );
    (res as AppResponse).data({ attendees }, 'Attendees retrieved');
});

// ══════════════════════════════════════════════════════════════════════════
// connection.slice.ts — new flat API surface
// ══════════════════════════════════════════════════════════════════════════

export const listConnections = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, status, tab, page, pageSize } = req.query;
    const result = await connectionService.listConnections(req.user!.id, {
        eventId: eventId as string | undefined,
        status: status as any,
        tab: tab as any,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });
    (res as AppResponse).data(result, 'Connections retrieved');
});

export const getReceivedConnections = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, page, pageSize } = req.query;
    const result = await connectionService.getReceivedConnections(req.user!.id, {
        eventId: eventId as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });
    (res as AppResponse).data(result, 'Received connection requests retrieved');
});

export const getSentConnections = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, page, pageSize } = req.query;
    const result = await connectionService.getSentConnections(req.user!.id, {
        eventId: eventId as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });
    (res as AppResponse).data(result, 'Sent connection requests retrieved');
});

export const getConnectionsStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await connectionService.getConnectionsStats(req.user!.id, req.query.eventId as string | undefined);
    (res as AppResponse).data(stats, 'Connection stats retrieved');
});

export const getPendingCount = asyncHandler(async (req: Request, res: Response) => {
    const result = await connectionService.getPendingCount(req.user!.id, req.query.eventId as string | undefined);
    (res as AppResponse).data(result, 'Pending count retrieved');
});

export const sendFlatConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
    const result = await connectionService.sendFlatConnectionRequest({
        requesterId: req.user!.id,
        userId: req.body.userId,
        eventId: req.body.eventId,
        intent: req.body.intent,
        message: req.body.message,
    });
    (res as AppResponse).data(result, 'Connection request sent', 201);
});

export const acceptConnectionFlat = asyncHandler(async (req: Request, res: Response) => {
    const result = await connectionService.acceptConnectionFlat(req.user!.id, req.params.connectionId);
    (res as AppResponse).data(result, 'Connection request accepted');
});

export const declineConnectionFlat = asyncHandler(async (req: Request, res: Response) => {
    const result = await connectionService.declineConnectionFlat(req.user!.id, req.params.connectionId);
    (res as AppResponse).data(result, 'Connection request declined');
});

export const cancelConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
    const result = await connectionService.cancelConnectionRequest(req.user!.id, req.params.connectionId);
    (res as AppResponse).data(result, 'Connection request cancelled');
});
