/**
 * @swagger
 * tags:
 *   name: Organisers
 *   description: Organiser registration, authentication, and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganiserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0f
 *         name:
 *           type: string
 *           example: Emeka Nwosu
 *         email:
 *           type: string
 *           example: emeka@techsummit.ng
 *         organisationName:
 *           type: string
 *           example: TechSummit Africa
 *         organisationDescription:
 *           type: string
 *           example: Africa's premier developer and founder conference.
 *         logoUrl:
 *           type: string
 *           example: https://cdn.example.com/logos/techsummit.png
 *         website:
 *           type: string
 *           example: https://techsummit.africa
 *         phone:
 *           type: string
 *           example: "+2348098765432"
 *         isVerified:
 *           type: boolean
 *           example: false
 *         accountType:
 *           type: string
 *           example: organiser
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *             type: object
 *             required: [name, email, password, organisationName]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Emeka Nwosu
 *               email:
 *                 type: string
 *                 format: email
 *                 example: emeka@techsummit.ng
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePass123
 *               organisationName:
 *                 type: string
 *                 maxLength: 150
 *                 example: TechSummit Africa
 *               organisationDescription:
 *                 type: string
 *                 maxLength: 600
 *                 example: Africa's premier developer and founder conference.
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://techsummit.africa
 *               phone:
 *                 type: string
 *                 example: "+2348098765432"
 *     responses:
 *       201:
 *         description: Organiser account created. Token also set as httpOnly cookie.
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
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: emeka@techsummit.ng
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful. Token also set as httpOnly cookie.
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
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *     summary: Get own organiser profile
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
 *                 message:
 *                   type: string
 *                   example: Profile retrieved
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
 *   patch:
 *     tags: [Organisers]
 *     summary: Update own organiser profile
 *     description: All fields are optional. Only send fields you want to change.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Emeka Nwosu
 *               organisationName:
 *                 type: string
 *                 maxLength: 150
 *                 example: TechSummit Africa 2.0
 *               organisationDescription:
 *                 type: string
 *                 maxLength: 600
 *                 example: Updated description.
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://cdn.example.com/logos/new-logo.png
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://techsummit.africa
 *               phone:
 *                 type: string
 *                 example: "+2348098765432"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated
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
 *     summary: Log out organiser
 *     description: Clears the auth cookie. Client should also discard the JWT token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 */

/**
 * @swagger
 * /api/v1/organisers/me/events:
 *   get:
 *     tags: [Organisers]
 *     summary: List own events
 *     description: Returns all events created by the authenticated organiser, including drafts and ended events. Sorted newest first.
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
 *                 message:
 *                   type: string
 *                   example: Your events retrieved
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
 */
