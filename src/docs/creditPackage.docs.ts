/**
 * @swagger
 * tags:
 *   name: Credit Packages
 *   description: Admin-managed purchasable credit packages shown to users on the wallet/pricing page
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditPackage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d7g
 *         name:
 *           type: string
 *           example: Starter Pack
 *         description:
 *           type: string
 *           nullable: true
 *           example: Great for attendees who want to try VIP networking.
 *         credits:
 *           type: integer
 *           description: Number of credits the user receives on purchase.
 *           example: 10
 *         price:
 *           type: number
 *           description: Price in the listed currency.
 *           example: 2500
 *         currency:
 *           type: string
 *           example: NGN
 *         isActive:
 *           type: boolean
 *           description: When false the package is hidden from users and cannot be purchased.
 *           example: true
 *         isPopular:
 *           type: boolean
 *           description: UI badge hint. Use to mark the recommended package.
 *           example: false
 *         sortOrder:
 *           type: integer
 *           description: Display order. Lower numbers appear first.
 *           example: 0
 *         createdBy:
 *           type: string
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
 * /api/v1/credit-packages:
 *   get:
 *     tags: [Credit Packages]
 *     summary: List active credit packages
 *     description: Public endpoint. Returns all active packages sorted by sortOrder then creation date. Use this to populate your wallet or pricing page.
 *     security: []
 *     responses:
 *       200:
 *         description: Active credit packages retrieved
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
 *                   example: Credit packages retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     packages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CreditPackage'
 *   post:
 *     tags: [Credit Packages]
 *     summary: Create a credit package
 *     description: Admin only. Requires the x-admin-key header.
 *     security:
 *       - AdminKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, credits, price]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 60
 *                 example: Starter Pack
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: Great for attendees who want to try VIP networking.
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 2500
 *               currency:
 *                 type: string
 *                 default: NGN
 *                 example: NGN
 *               isPopular:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 0
 *           example:
 *             name: Starter Pack
 *             description: Great for attendees who want to try VIP networking.
 *             credits: 10
 *             price: 2500
 *             currency: NGN
 *             isPopular: false
 *             sortOrder: 0
 *     responses:
 *       201:
 *         description: Credit package created
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
 *                   example: Credit package created
 *                 data:
 *                   type: object
 *                   properties:
 *                     package:
 *                       $ref: '#/components/schemas/CreditPackage'
 *       403:
 *         description: Invalid or missing admin key
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
 * /api/v1/credit-packages/all:
 *   get:
 *     tags: [Credit Packages]
 *     summary: List all credit packages including inactive ones
 *     description: Admin only. Returns all packages regardless of isActive status.
 *     security:
 *       - AdminKey: []
 *     responses:
 *       200:
 *         description: All credit packages retrieved
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
 *                   example: All credit packages retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     packages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CreditPackage'
 *       403:
 *         description: Invalid or missing admin key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/credit-packages/{id}:
 *   patch:
 *     tags: [Credit Packages]
 *     summary: Update a credit package
 *     description: Admin only. All fields are optional. Send only the fields you want to change.
 *     security:
 *       - AdminKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d7g
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 60
 *                 example: Starter Pack - Revised
 *               description:
 *                 type: string
 *                 maxLength: 200
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 example: 12
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 2000
 *               currency:
 *                 type: string
 *                 example: NGN
 *               isPopular:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 description: Set to false to hide this package without deleting it.
 *                 example: true
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       200:
 *         description: Credit package updated
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
 *                   example: Credit package updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     package:
 *                       $ref: '#/components/schemas/CreditPackage'
 *       403:
 *         description: Invalid or missing admin key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Credit package not found
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
 *   delete:
 *     tags: [Credit Packages]
 *     summary: Deactivate a credit package
 *     description: >
 *       Admin only. Sets isActive to false — the package is never hard-deleted.
 *       Existing CreditTransaction records that reference this package remain intact.
 *       Deactivated packages no longer appear in the public listing and cannot be purchased.
 *     security:
 *       - AdminKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 664f1b2c3d4e5f6a7b8c9d7g
 *     responses:
 *       200:
 *         description: Credit package deactivated
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
 *                   example: Credit package deactivated
 *                 data:
 *                   type: object
 *                   properties:
 *                     package:
 *                       $ref: '#/components/schemas/CreditPackage'
 *       403:
 *         description: Invalid or missing admin key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Credit package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
