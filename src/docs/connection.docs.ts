/**
 * @swagger
 * tags:
 *   name: Connections
 *   description: Attendee discovery and connection requests within an event tier
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendeePublicProfile:
 *       type: object
 *       description: Public profile of an attendee as seen by peers in the same tier.
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0e
 *         name:
 *           type: string
 *           example: Ada Okafor
 *         email:
 *           type: string
 *           example: ada@example.com
 *         avatarUrl:
 *           type: string
 *           example: https://cdn.example.com/avatars/ada.jpg
 *         company:
 *           type: string
 *           example: PayStack Ventures
 *         role:
 *           type: string
 *           example: Founder and CEO
 *         industry:
 *           type: string
 *           example: Fintech
 *         bio:
 *           type: string
 *           example: Fintech founder building infrastructure for African markets.
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["DeFi", "Payments", "Web3"]
 *         networkingGoals:
 *           type: string
 *           example: Looking for Series A investors.
 *         tierId:
 *           type: string
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         tierLabel:
 *           type: string
 *           example: Founders Pass
 *         connectionStatus:
 *           type: string
 *           description: Current connection status between the viewer and this attendee.
 *           enum: [none, pending, accepted, declined]
 *           example: none
 *
 *     Connection:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d3c
 *         eventId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d1a
 *         requesterId:
 *           type: object
 *           description: Populated requester profile.
 *           properties:
 *             _id:
 *               type: string
 *               example: 664f1b2c3d4e5f6a7b8c9d0e
 *             name:
 *               type: string
 *               example: Ada Okafor
 *             email:
 *               type: string
 *               example: ada@example.com
 *             avatarUrl:
 *               type: string
 *               example: https://cdn.example.com/avatars/ada.jpg
 *             company:
 *               type: string
 *               example: PayStack Ventures
 *             role:
 *               type: string
 *               example: Founder and CEO
 *         recipientId:
 *           type: object
 *           description: Populated recipient profile.
 *           properties:
 *             _id:
 *               type: string
 *               example: 664f1b2c3d4e5f6a7b8c9d0d
 *             name:
 *               type: string
 *               example: Tunde Balogun
 *             email:
 *               type: string
 *               example: tunde@vcfund.ng
 *             avatarUrl:
 *               type: string
 *               example: https://cdn.example.com/avatars/tunde.jpg
 *             company:
 *               type: string
 *               example: Alitheia Capital
 *             role:
 *               type: string
 *               example: General Partner
 *         requesterTierId:
 *           type: string
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         recipientTierId:
 *           type: string
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined]
 *           example: pending
 *         intentionTag:
 *           type: string
 *           enum: [Hiring, Investment, Partnership, Mentorship, Sales, Collaboration]
 *           example: Investment
 *         message:
 *           type: string
 *           example: Hi Tunde, I would love to discuss our Series A round with you.
 *         creditCost:
 *           type: integer
 *           description: Credits spent to send this request. 0 if the recipient had no VIP protection.
 *           example: 3
 *         wasVipGated:
 *           type: boolean
 *           description: True if the recipient had VIP protection enabled at the time of the request.
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/events/{eventId}/attendees:
 *   get:
 *     tags: [Connections]
 *     summary: Browse attendees in your tier
 *     description: >
 *       User only. Must have a confirmed registration for this event.
 *       Returns all confirmed attendees in the same tier as the requesting user, excluding the user themselves.
 *       Each attendee is annotated with the current connectionStatus (none, pending, accepted, declined).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d1a
 *     responses:
 *       200:
 *         description: Attendees retrieved
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
 *                   example: Attendees retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendeePublicProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not a confirmed attendee of this event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/events/{eventId}/connections:
 *   post:
 *     tags: [Connections]
 *     summary: Send a connection request
 *     description: >
 *       User only. Both the requester and recipient must have confirmed registrations for the event in the same tier.
 *       If the recipient has VIP protection enabled and holds the VIP tier, the requester must have sufficient credits.
 *       Credits are debited atomically at the time of the request. If the VIP later accepts, they receive a cashback credit reward based on the platform cashback ratio.
 *       Duplicate requests (including reversed direction) are blocked.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d1a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, intentionTag]
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: User ID of the attendee you want to connect with.
 *                 example: 664f1b2c3d4e5f6a7b8c9d0d
 *               intentionTag:
 *                 type: string
 *                 description: Purpose of the connection request.
 *                 enum: [Hiring, Investment, Partnership, Mentorship, Sales, Collaboration]
 *                 example: Investment
 *               message:
 *                 type: string
 *                 maxLength: 300
 *                 description: Optional intro message sent with the request.
 *                 example: Hi Tunde, I would love to discuss our Series A round with you.
 *     responses:
 *       201:
 *         description: Connection request sent
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
 *         description: Recipient not a confirmed attendee, different tier, or insufficient credits for a VIP-gated request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               different_tier:
 *                 summary: Tier mismatch
 *                 value:
 *                   success: false
 *                   message: You can only connect with attendees in your tier
 *               insufficient_credits:
 *                 summary: Not enough credits
 *                 value:
 *                   success: false
 *                   message: Insufficient credits. You have 1 credit(s) but need 3.
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not a confirmed attendee of this event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: A connection request already exists between you and this attendee
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
 *     summary: List own connections for an event
 *     description: User only. Must have a confirmed registration. Returns all pending and accepted connection requests where the user is either the requester or the recipient.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d1a
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
 *                 message:
 *                   type: string
 *                   example: Connections retrieved
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
 *         description: Not a confirmed attendee of this event
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
 *     summary: Accept or decline a connection request
 *     description: >
 *       User only. Only the recipient of the request can respond.
 *       The request must still be in pending status.
 *       If the request was VIP-gated (wasVipGated = true) and the action is accept,
 *       the VIP automatically receives cashback credits calculated from the platform cashback ratio.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d3c
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, decline]
 *                 example: accept
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
 *         description: Only the recipient can respond to this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Connection request not found
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
