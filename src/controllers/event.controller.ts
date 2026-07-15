import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as eventService from '../services/event.service';

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.createEvent(req.user!.id, req.body);
    (res as AppResponse).data({ event }, 'Event created successfully', 201);
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await eventService.getEvents({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string | undefined,
    });
    (res as AppResponse).data(result, 'Events retrieved');
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
    console.log("hereeeeee")
    const event = await eventService.getEventById(req.params.eventId);
    (res as AppResponse).data(event, 'Event retrieved');
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.updateEvent(req.user!.id, req.params.eventId, req.body);
    (res as AppResponse).data({ event }, 'Event updated');
});

export const publishEvent = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.publishEvent(req.user!.id, req.params.eventId);
    (res as AppResponse).data({ event }, 'Event published successfully');
});



export const getMyEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await eventService.getOrganiserEvents(req.user!.id);
    (res as AppResponse).data({ data: events }, 'Your events retrieved');
});

export const getEventAttendees = asyncHandler(async (req: Request, res: Response) => {
    const { eventId} = req.query;
    console.log(req.query)
    const attendees = eventId 
    ? await eventService.getEventAttendeesHandler(eventId, req.query) 
    : await eventService.getAllEventsAttendeesHandler(req.user!.id, req.query) ;
    (res as AppResponse).data(attendees, 'Your attendees retrieved');
});


