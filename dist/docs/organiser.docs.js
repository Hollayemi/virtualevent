"use strict";
/**
 * @swagger
 * tags:
 *   name: Organisers
 *   description: Organiser account registration, login, profile, and their events
 */
/**
 * @swagger
 * /api/v1/organisers/register:
 *   post:
 *     tags: [Organisers]
 *     summary: Register a new organiser account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterOrganiserRequest'
 *           example:
 *             name: Oluwasusi Stephen
 *             email: stephen@nasrda.com
 *             password: Secret@123
 *             organisationName: NASRDA
 *             organisationDescription: We run tech events across the Nigeria.
 *             website: https://nasrda.com
 *             phone: "+2347911123456"
 *     responses:
 *       201:
 *         description: Organiser account created. JWT set as httpOnly cookie.
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
 *                   example: Organiser account created
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     organiser:
 *                       $ref: '#/components/schemas/OrganiserProfile'
 *       409:
 *         description: Email already registered
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
 * /api/v1/organisers/login:
 *   post:
 *     tags: [Organisers]
 *     summary: Log in as an organiser
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: stephen@techconf.com
 *             password: Secret@123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     organiser:
 *                       $ref: '#/components/schemas/OrganiserProfile'
 *       401:
 *         description: Invalid email or password
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
 * /api/v1/organisers/me:
 *   get:
 *     tags: [Organisers]
 *     summary: Get the authenticated organiser's profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
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
 *                     organiser:
 *                       $ref: '#/components/schemas/OrganiserProfile'
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
 *   patch:
 *     tags: [Organisers]
 *     summary: Update the authenticated organiser's profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrganiserRequest'
 *           example:
 *             organisationDescription: Updated description.
 *             logoUrl: https://cdn.example.com/logo.png
 *     responses:
 *       200:
 *         description: Profile updated
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
 *                     organiser:
 *                       $ref: '#/components/schemas/OrganiserProfile'
 *       401:
 *         description: Not authenticated
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
 * /api/v1/organisers/logout:
 *   post:
 *     tags: [Organisers]
 *     summary: Log out,  clears the auth cookie
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
/**
 * @swagger
 * /api/v1/organisers/me/events:
 *   get:
 *     tags: [Organisers]
 *     summary: List all events created by the authenticated organiser
 *     description: Returns all events (any status) owned by this organiser, sorted newest first.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Events retrieved
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
 */
//# sourceMappingURL=organiser.docs.js.map