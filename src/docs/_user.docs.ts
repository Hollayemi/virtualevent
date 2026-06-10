/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User registration, authentication, and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
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
 *         phone:
 *           type: string
 *           example: "+2348012345678"
 *         bio:
 *           type: string
 *           example: Fintech founder building infrastructure for African markets.
 *         role:
 *           type: string
 *           example: Founder and CEO
 *         company:
 *           type: string
 *           example: PayStack Ventures
 *         industry:
 *           type: string
 *           example: Fintech
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["DeFi", "Payments", "Web3"]
 *         networkingGoals:
 *           type: string
 *           example: Looking for Series A investors and technical co-founders.
 *         avatarUrl:
 *           type: string
 *           example: https://cdn.example.com/avatars/ada.jpg
 *         isVerified:
 *           type: boolean
 *           example: false
 *         vipProtectionEnabled:
 *           type: boolean
 *           example: false
 *         accountType:
 *           type: string
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user account
 *     description: Creates a user account and returns a JWT. A credit wallet is automatically created for the user.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Ada Okafor
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePass123
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: Fintech founder building infrastructure for African markets.
 *               role:
 *                 type: string
 *                 maxLength: 100
 *                 example: Founder and CEO
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: PayStack Ventures
 *               industry:
 *                 type: string
 *                 maxLength: 100
 *                 example: Fintech
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["DeFi", "Payments", "Web3"]
 *               networkingGoals:
 *                 type: string
 *                 maxLength: 300
 *                 example: Looking for Series A investors and technical co-founders.
 *     responses:
 *       201:
 *         description: Account created. Token also set as httpOnly cookie.
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
 *                   example: Account created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
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
 * /api/v1/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Log in as a user
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
 *                 example: ada@example.com
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
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
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
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
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
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Users]
 *     summary: Update own profile
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
 *                 example: Ada Okafor
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated bio text.
 *               role:
 *                 type: string
 *                 maxLength: 100
 *                 example: CTO
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: BuildCo
 *               industry:
 *                 type: string
 *                 maxLength: 100
 *                 example: SaaS
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AI", "Developer Tools"]
 *               networkingGoals:
 *                 type: string
 *                 maxLength: 300
 *                 example: Seeking enterprise partnerships.
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://cdn.example.com/avatars/ada-new.jpg
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
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
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
 * /api/v1/users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Log out
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
 * /api/v1/users/me/vip-protection:
 *   patch:
 *     tags: [Users]
 *     summary: Toggle VIP protection
 *     description: >
 *       When enabled, users from lower tiers must spend credits to send you a connection request.
 *       VIP protection is only meaningful when you hold a VIP-tier registration in at least one active event.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enabled]
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: VIP protection status updated
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
 *                   example: VIP protection enabled
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
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
