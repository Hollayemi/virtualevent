/**
 * @swagger
 * tags:
 *   name: Connections
 *   description: In-event networking,  send, browse, and respond to connection requests
 */

/**
 * @swagger
 * /api/v1/events/{eventId}/connections:
 *   post:
 *     tags: [Connections]
 *     summary: Send a connection request to another attendee
 *     description: >
 *       User only. Both the sender and recipient must be **confirmed** attendees of this event
 *       and must be in the **same tier**. Only one connection request can exist between any two
 *       users in an event (regardless of direction).
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
 *             $ref: '#/components/schemas/SendConnectionRequest'
 *           example:
 *             recipientId: 64f1a2b3c4d5e6f7a8b9c0d2
 *             intentionTag: Partnership
 *             message: "I loved your talk,  let's explore a collaboration!"
 *     responses:
 *       201:
 *         description: Connection request sent. Status is "pending".
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
 *                   example: Connection request sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     connection:
 *                       $ref: '#/components/schemas/Connection'
 *       400:
 *         description: Cannot send to yourself, or recipient is not a confirmed attendee
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
 *         description: Not a confirmed attendee, or different tier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: A connection already exists between these two users in this event
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
 *   get:
 *     tags: [Connections]
 *     summary: Get all connections for the authenticated user in an event
 *     description: >
 *       User only,  must be a confirmed attendee. Returns connections where the user
 *       is either the requester or the recipient, sorted newest first.
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
 *         description: Connections retrieved
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
 *                     connections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Connection'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not a confirmed attendee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/events/{eventId}/attendees:
 *   get:
 *     tags: [Connections]
 *     summary: Browse attendees in the same tier
 *     description: >
 *       User only,  must be a confirmed attendee. Returns all confirmed attendees
 *       in the same tier as the authenticated user (excluding themselves).
 *       Each attendee is annotated with a `connectionStatus` field:
 *       `none` | `pending` | `accepted` | `declined`.
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
 *         description: Attendees retrieved with connection status annotations
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
 *                     attendees:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/UserProfile'
 *                           - type: object
 *                             properties:
 *                               connectionStatus:
 *                                 type: string
 *                                 enum: [none, pending, accepted, declined]
 *                                 example: none
 *                               tierId:
 *                                 type: string
 *                               tierLabel:
 *                                 type: string
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not a confirmed attendee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/connections/{connectionId}/respond:
 *   patch:
 *     tags: [Connections]
 *     summary: Accept or decline a received connection request
 *     description: >
 *       User only,  must be the **recipient** of the request.
 *       A request can only be responded to once; attempting to respond again returns 400.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the connection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RespondConnectionRequest'
 *           example:
 *             action: accept
 *     responses:
 *       200:
 *         description: Connection request accepted or declined
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
 *                   example: Connection request accepted
 *                 data:
 *                   type: object
 *                   properties:
 *                     connection:
 *                       $ref: '#/components/schemas/Connection'
 *       400:
 *         description: Request has already been accepted or declined
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
 *         description: Not the recipient of this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Connection not found
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
