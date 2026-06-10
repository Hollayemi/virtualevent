/**
 * @swagger
 * tags:
 *   name: Credit Config
 *   description: Admin-only platform-wide credit economy settings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditConfig:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d8h
 *         cashbackRatio:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: >
 *             Fraction of spent credits awarded to the VIP as cashback when they accept a request.
 *             Example: 0.33 means a user who spends 3 credits generates 1 credit cashback for the VIP (Math.floor(3 x 0.33)).
 *             Set to 0 to disable cashback entirely.
 *           example: 0.33
 *         registrationRewardAmount:
 *           type: integer
 *           minimum: 0
 *           description: Credits awarded to a user immediately after their registration is confirmed. Set to 0 to disable.
 *           example: 2
 *         referralRewardAmount:
 *           type: integer
 *           minimum: 0
 *           description: >
 *             Credits awarded to a referrer when the user they referred completes their first ever confirmed registration.
 *             Only fires once per referred user regardless of how many events they later register for.
 *             Set to 0 to disable.
 *           example: 5
 *         vipRequestCost:
 *           type: integer
 *           minimum: 1
 *           description: Default credit cost for a lower-tier user to send a connection request to a VIP-protected attendee.
 *           example: 3
 *         updatedBy:
 *           type: string
 *           nullable: true
 *           description: Identifier of the admin who last updated the config.
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/credit-config:
 *   get:
 *     tags: [Credit Config]
 *     summary: Get current credit economy config
 *     description: >
 *       Admin only. Returns the singleton credit config document.
 *       If no config has been saved yet, the platform defaults are bootstrapped and returned
 *       (cashbackRatio: 0.33, registrationRewardAmount: 0, referralRewardAmount: 0, vipRequestCost: 3).
 *     security:
 *       - AdminKey: []
 *     responses:
 *       200:
 *         description: Credit config retrieved
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
 *                   example: Credit config retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       $ref: '#/components/schemas/CreditConfig'
 *       403:
 *         description: Invalid or missing admin key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Credit Config]
 *     summary: Update credit economy config
 *     description: >
 *       Admin only. Replaces the entire config in one operation. All fields are required.
 *       Changes take effect immediately for all subsequent transactions across the platform.
 *       This is a singleton — only one config document ever exists. Calling PUT creates it if it does not exist yet.
 *     security:
 *       - AdminKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cashbackRatio, registrationRewardAmount, referralRewardAmount, vipRequestCost]
 *             properties:
 *               cashbackRatio:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 1
 *                 description: >
 *                   Fraction of spent credits returned to the VIP as cashback on request acceptance.
 *                   Must be between 0 and 1 inclusive. Use 0 to disable cashback.
 *                 example: 0.33
 *               registrationRewardAmount:
 *                 type: integer
 *                 minimum: 0
 *                 description: Credits to award per confirmed event registration. Use 0 to disable.
 *                 example: 2
 *               referralRewardAmount:
 *                 type: integer
 *                 minimum: 0
 *                 description: Credits to award a referrer when their referred user completes their first registration. Use 0 to disable.
 *                 example: 5
 *               vipRequestCost:
 *                 type: integer
 *                 minimum: 1
 *                 description: Credits a lower-tier user must spend to send a connection request to a VIP-protected attendee.
 *                 example: 3
 *           example:
 *             cashbackRatio: 0.33
 *             registrationRewardAmount: 2
 *             referralRewardAmount: 5
 *             vipRequestCost: 3
 *     responses:
 *       200:
 *         description: Credit config updated
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
 *                   example: Credit config updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       $ref: '#/components/schemas/CreditConfig'
 *       403:
 *         description: Invalid or missing admin key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed (e.g. cashbackRatio out of range)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
