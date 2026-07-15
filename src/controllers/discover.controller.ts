import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as discoverService from '../services/discover.service';
import * as connectionService from '../services/connection.service';

export const discoverAttendees = asyncHandler(async (req: Request, res: Response) => {
    const { search, industry, role, tier, interest, eventId, page, pageSize } = req.query;
    const result = await discoverService.discoverAttendees(req.user!.id, {
        search: search as string | undefined,
        industry: industry as string | undefined,
        role: role as string | undefined,
        tier: tier as any,
        interest: interest as string | undefined,
        eventId: eventId as string,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });
    (res as AppResponse).data(result, 'Attendees retrieved');
});

export const getSuggestedAttendees = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, limit } = req.query;
    const result = await discoverService.getSuggestedAttendees(req.user!.id, {
        eventId: eventId as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    (res as AppResponse).data(result, 'Suggested attendees retrieved');
});

export const getAttendeeDetail = asyncHandler(async (req: Request, res: Response) => {
    const result = await discoverService.getAttendeeDetail(req.user!.id, {
        userId: req.params.userId,
        eventId: req.query.eventId as string | undefined,
    });
    (res as AppResponse).data(result, 'Attendee profile retrieved');
});

export const connectFromDiscover = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, intent, message } = req.body;

    const result = await connectionService.sendFlatConnectionRequest({
        requesterId: req.user!.id,
        userId: req.params.userId,
        eventId,
        intent,
        message,
    });

    (res as AppResponse).data(
        {
            userId: req.params.userId,
            eventId,
            connectionId: result.connectionId,
            status: result.status === 'accepted' ? 'connected' : 'pending',
            creditsSpent: result.creditsSpent,
        },
        'Connection request sent',
        201,
    );
});

export const getDiscoverFilters = asyncHandler(async (req: Request, res: Response) => {
    const result = await discoverService.getDiscoverFilters(req.query.eventId as string);
    (res as AppResponse).data(result, 'Discover filters retrieved');
});
