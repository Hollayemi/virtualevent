"use strict";
/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Event registration,  sign up, view, and cancel
 */
/**
 * @swagger
 * /api/v1/events/{eventId}/register:
 *   post:
 *     tags: [Registrations]
 *     summary: Register for an event
 *     description: >
 *       User only. Registers the authenticated user for a published event.
 *       Registration is auto-confirmed (no payment required in Milestone 1).
 *       Each user may only register once per event.
 *       If the chosen tier has a capacity limit and is full, registration is blocked.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterForEventRequest'
 *           example:
 *             tierId: a1b2c3d4-uuid-of-tier
 *             customFieldValues:
 *               linkedinUrl: https://linkedin.com/in/alice
 *               dietaryRequirements: vegan
 *     responses:
 *       201:
 *         description: Successfully registered. Status is immediately "confirmed".
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully registered for event
 *                 data:
 *                   type: object
 *                   properties:
 *                     registration:
 *                       $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Event not published, invalid tier, tier at capacity, or required custom field missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: User account required
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
 *       409:
 *         description: Already registered for this event
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
 * /api/v1/events/{eventId}/registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: List all registrations for an event
 *     description: Organiser only,  must own the event. Returns all registrations including cancelled ones.
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
 *         description: Registrations retrieved
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
 *                     registrations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Not authenticated
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
 */
/**
 * @swagger
 * /api/v1/registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: List the authenticated user's registrations across all events
 *     description: User only. Returns all non-cancelled registrations sorted by registration date descending.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Registrations retrieved
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
 *                     registrations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: User account required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/v1/registrations/{registrationId}/cancel:
 *   patch:
 *     tags: [Registrations]
 *     summary: Cancel a registration
 *     description: User only,  must be the registrant. Decrements the event's totalRegistrations counter.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the registration
 *     responses:
 *       200:
 *         description: Registration cancelled
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
 *                     registration:
 *                       $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Registration is already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not the registrant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//# sourceMappingURL=registration.docs.js.map