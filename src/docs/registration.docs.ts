/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Event enrollment and registration management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d2b
 *         userId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0e
 *         eventId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d1a
 *         tierId:
 *           type: string
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         tierLabel:
 *           type: string
 *           description: Snapshot of the tier label at the time of registration.
 *           example: Founders Pass
 *         tierPrice:
 *           type: number
 *           description: Snapshot of the tier price at the time of registration.
 *           example: 99
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           example: confirmed
 *         customFieldValues:
 *           type: object
 *           description: Attendee responses to the event's custom registration fields.
 *           additionalProperties:
 *             oneOf:
 *               - type: string
 *               - type: boolean
 *               - type: number
 *           example:
 *             linkedinUrl: https://linkedin.com/in/adaokafor
 *             jobTitle: Founder and CEO
 *         referredBy:
 *           type: string
 *           nullable: true
 *           description: User ID of the person who referred this attendee, if any.
 *           example: 664f1b2c3d4e5f6a7b8c9d0c
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/events/{eventId}/register:
 *   post:
 *     tags: [Registrations]
 *     summary: Register for an event
 *     description: >
 *       User only. Registers the authenticated user for the specified event under a chosen tier.
 *       The event must be published. A user can only register once per event.
 *       If the tier has a capacity limit, it is enforced at registration time.
 *       All required custom fields defined on the event must be supplied.
 *       Registration is auto-confirmed. If a registration reward is configured, credits are issued immediately.
 *       Pass referredBy in the body to credit the referrer (only counts on the user's first ever registration).
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
 *             required: [tierId]
 *             properties:
 *               tierId:
 *                 type: string
 *                 description: The tierId of the tier the user is registering under. Get this from the event's tiers array.
 *                 example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               customFieldValues:
 *                 type: object
 *                 description: >
 *                   Key-value map of responses to the event's custom fields.
 *                   Keys must match the fieldKey values defined on the event.
 *                   All fields marked isRequired must be included.
 *                 additionalProperties:
 *                   oneOf:
 *                     - type: string
 *                     - type: boolean
 *                     - type: number
 *                 example:
 *                   linkedinUrl: https://linkedin.com/in/adaokafor
 *                   jobTitle: Founder and CEO
 *               referredBy:
 *                 type: string
 *                 description: User ID of the person who referred this user. Referral reward only fires on the user's first ever confirmed registration.
 *                 example: 664f1b2c3d4e5f6a7b8c9d0c
 *     responses:
 *       201:
 *         description: Successfully registered for the event
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
 *         description: Event not published, invalid tier, missing required custom fields, or tier at full capacity
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
 *     summary: List registrations for an event
 *     description: Organiser only. Must own the event. Returns all registrations including attendee profile snapshots.
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
 *         description: Registrations retrieved
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
 *                   example: Registrations retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     registrations:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Registration'
 *                           - type: object
 *                             properties:
 *                               userId:
 *                                 type: object
 *                                 description: Populated user object (name, email, company, role, industry, avatarUrl)
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     example: 664f1b2c3d4e5f6a7b8c9d0e
 *                                   name:
 *                                     type: string
 *                                     example: Ada Okafor
 *                                   email:
 *                                     type: string
 *                                     example: ada@example.com
 *                                   company:
 *                                     type: string
 *                                     example: PayStack Ventures
 *                                   role:
 *                                     type: string
 *                                     example: Founder and CEO
 *                                   industry:
 *                                     type: string
 *                                     example: Fintech
 *                                   avatarUrl:
 *                                     type: string
 *                                     example: https://cdn.example.com/avatars/ada.jpg
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
 *     summary: List own registrations
 *     description: User only. Returns all non-cancelled registrations for the authenticated user, with event details populated. Sorted newest first.
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
 *                 message:
 *                   type: string
 *                   example: Your registrations retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     registrations:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Registration'
 *                           - type: object
 *                             properties:
 *                               eventId:
 *                                 type: object
 *                                 description: Populated event object (name, description, startDate, endDate, location, bannerUrl, status)
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     example: 664f1b2c3d4e5f6a7b8c9d1a
 *                                   name:
 *                                     type: string
 *                                     example: Startup Founders Summit 2025
 *                                   startDate:
 *                                     type: string
 *                                     format: date-time
 *                                   endDate:
 *                                     type: string
 *                                     format: date-time
 *                                   location:
 *                                     $ref: '#/components/schemas/EventLocation'
 *                                   bannerUrl:
 *                                     type: string
 *                                     example: https://cdn.example.com/banners/summit.jpg
 *                                   status:
 *                                     type: string
 *                                     example: published
 *       401:
 *         description: Not authenticated
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
 *     description: User only. Must own the registration. Sets status to cancelled and decrements the event's totalRegistrations counter.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d2b
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
 *                 message:
 *                   type: string
 *                   example: Registration cancelled
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
 *         description: Not your registration
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
