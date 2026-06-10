/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event creation, discovery, and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tier:
 *       type: object
 *       properties:
 *         tierId:
 *           type: string
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         label:
 *           type: string
 *           example: Founders Pass
 *         description:
 *           type: string
 *           example: Full access for founders and C-suite attendees.
 *         price:
 *           type: number
 *           example: 99
 *         capacity:
 *           type: integer
 *           example: 50
 *         isVIP:
 *           type: boolean
 *           description: True if this is the highest-priced tier in the event. Derived automatically.
 *           example: true
 *         color:
 *           type: string
 *           example: "#7C3AED"
 *
 *     CustomField:
 *       type: object
 *       properties:
 *         fieldKey:
 *           type: string
 *           example: linkedinUrl
 *         label:
 *           type: string
 *           example: LinkedIn Profile
 *         type:
 *           type: string
 *           enum: [text, textarea, select, checkbox, url, number]
 *           example: url
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         isRequired:
 *           type: boolean
 *           example: true
 *         placeholder:
 *           type: string
 *           example: https://linkedin.com/in/yourprofile
 *
 *     EventLocation:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [physical, virtual, hybrid]
 *           example: physical
 *         address:
 *           type: string
 *           example: 12 Innovation Drive, Victoria Island
 *         city:
 *           type: string
 *           example: Lagos
 *         virtualLink:
 *           type: string
 *           example: https://meet.google.com/abc-def-ghi
 *
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d1a
 *         organiserId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0f
 *         name:
 *           type: string
 *           example: Startup Founders Summit 2025
 *         description:
 *           type: string
 *           example: Annual networking event for early-stage founders and investors.
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T09:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T18:00:00.000Z"
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         bannerUrl:
 *           type: string
 *           example: https://cdn.example.com/banners/summit.jpg
 *         status:
 *           type: string
 *           enum: [draft, published, ended]
 *           example: published
 *         tiers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tier'
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomField'
 *         totalRegistrations:
 *           type: integer
 *           example: 143
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateEventRequest:
 *       type: object
 *       required: [name, description, startDate, endDate, location, tiers]
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 150
 *           example: Startup Founders Summit 2025
 *         description:
 *           type: string
 *           maxLength: 2000
 *           example: Annual networking event for early-stage founders and investors.
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T09:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T18:00:00.000Z"
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         bannerUrl:
 *           type: string
 *           format: uri
 *           example: https://cdn.example.com/banners/summit.jpg
 *         tiers:
 *           type: array
 *           minItems: 1
 *           description: Prices must be unique within the event. The highest-priced tier is automatically marked as VIP.
 *           items:
 *             type: object
 *             required: [label, price]
 *             properties:
 *               label:
 *                 type: string
 *                 maxLength: 60
 *                 example: Founders Pass
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: Full access for founders and C-suite.
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 99
 *               capacity:
 *                 type: integer
 *                 minimum: 0
 *                 description: 0 means unlimited capacity.
 *                 example: 50
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 example: "#7C3AED"
 *         customFields:
 *           type: array
 *           description: Additional fields collected at registration. fieldKey values must be unique.
 *           items:
 *             type: object
 *             required: [fieldKey, label, type]
 *             properties:
 *               fieldKey:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: linkedinUrl
 *               label:
 *                 type: string
 *                 example: LinkedIn Profile
 *               type:
 *                 type: string
 *                 enum: [text, textarea, select, checkbox, url, number]
 *                 example: url
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required only when type is select.
 *               isRequired:
 *                 type: boolean
 *                 default: false
 *               placeholder:
 *                 type: string
 *                 example: https://linkedin.com/in/yourprofile
 *
 *     UpdateEventRequest:
 *       type: object
 *       description: All fields are optional. Tiers and customFields cannot be changed after the event is published.
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 150
 *           example: Updated Summit Name
 *         description:
 *           type: string
 *           maxLength: 2000
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         bannerUrl:
 *           type: string
 *           format: uri
 *           example: https://cdn.example.com/banners/updated.jpg
 *         tiers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tier'
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomField'
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 84
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         totalPages:
 *           type: integer
 *           example: 5
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
 *         description: Paginated list of published events
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
 *                   example: Events retrieved
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
 *     description: Organiser only. Event is created in draft status. Call the publish endpoint when ready to go live.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *           example:
 *             name: Startup Founders Summit 2025
 *             description: Annual networking event for early-stage founders and investors.
 *             startDate: "2025-09-01T09:00:00.000Z"
 *             endDate: "2025-09-01T18:00:00.000Z"
 *             location:
 *               type: physical
 *               address: 12 Innovation Drive, Victoria Island
 *               city: Lagos
 *             tiers:
 *               - label: General
 *                 price: 0
 *                 capacity: 300
 *               - label: Founders Pass
 *                 price: 99
 *                 capacity: 50
 *                 color: "#7C3AED"
 *             customFields:
 *               - fieldKey: linkedinUrl
 *                 label: LinkedIn Profile
 *                 type: url
 *                 isRequired: true
 *                 placeholder: https://linkedin.com/in/yourprofile
 *               - fieldKey: jobTitle
 *                 label: Current Job Title
 *                 type: text
 *                 isRequired: false
 *     responses:
 *       201:
 *         description: Event created with status draft
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
 *                   example: Event created successfully
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
 *         description: Validation failed (e.g. duplicate tier prices, missing required fields)
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
 *     description: Public endpoint. Returns full event details including tiers, custom fields, and organiser info.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d1a
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
 *                 message:
 *                   type: string
 *                   example: Event retrieved
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
 *     description: Organiser only, must own the event. Tiers and customFields cannot be modified after the event is published. Send only the fields you want to update.
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
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *           example:
 *             name: Startup Founders Summit 2025 - Updated
 *             bannerUrl: https://cdn.example.com/banners/updated.jpg
 *             location:
 *               type: hybrid
 *               address: 12 Innovation Drive, Victoria Island
 *               city: Lagos
 *               virtualLink: https://meet.google.com/abc-def-ghi
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Cannot modify tiers or customFields on a published event
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
 *     description: Organiser only, must own the event. Event must have at least one tier. Once published, tiers and customFields are locked and cannot be changed.
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
 *         description: Event published
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
 *                   example: Event published successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Event is already published, or has no tiers defined
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
