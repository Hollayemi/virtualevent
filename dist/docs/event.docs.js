"use strict";
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event creation, discovery, and management
 */
/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     tags: [Events]
 *     summary: List all published events
 *     description: Public endpoint. Returns paginated published events. Supports search by name or description.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term matched against event name and description
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     description: Organiser only. Event is created in **draft** status. Publish separately when ready.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *           example:
 *             name: Startup Founders Summit
 *             description: Annual networking event for early-stage founders.
 *             startDate: "2025-09-01T09:00:00.000Z"
 *             endDate: "2025-09-01T18:00:00.000Z"
 *             location:
 *               type: physical
 *               address: Ya'Adua Road
 *               city: Nigeria
 *             tiers:
 *               - label: General
 *                 price: 0
 *                 capacity: 200
 *               - label: Founders Pass
 *                 price: 99
 *                 capacity: 50
 *                 color: "#7C3AED"
 *             customFields:
 *               - fieldKey: linkedinUrl
 *                 label: LinkedIn Profile
 *                 type: url
 *                 isRequired: true
 *     responses:
 *       201:
 *         description: Event created (status = draft)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Organiser account required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   get:
 *     tags: [Events]
 *     summary: Get a single event by ID
 *     description: Public endpoint. Returns full event details including tiers and custom fields.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the event
 *     responses:
 *       200:
 *         description: Event retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Events]
 *     summary: Update an event
 *     description: >
 *       Organiser only,  must own the event.
 *       **Tiers and custom fields cannot be modified after the event is published.**
 *       Only send the fields you want to update.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *           example:
 *             name: Updated Summit Name
 *             bannerUrl: https://cdn.example.com/banner.jpg
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Cannot modify tiers/customFields on a published event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not the event owner or wrong account type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
/**
 * @swagger
 * /api/v1/events/{eventId}/publish:
 *   patch:
 *     tags: [Events]
 *     summary: Publish a draft event
 *     description: >
 *       Organiser only,  must own the event.
 *       Event must have at least one tier. Once published,
 *       tiers and custom fields are locked.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Already published or no tiers defined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not the event owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//# sourceMappingURL=event.docs.js.map