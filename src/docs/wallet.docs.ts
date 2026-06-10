/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Credit wallet balance, transaction history, and credit package purchases
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d4d
 *         userId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0e
 *         balance:
 *           type: integer
 *           description: Current spendable credits.
 *           example: 47
 *         totalEarned:
 *           type: integer
 *           description: Lifetime credits earned through purchases, rewards, and cashback.
 *           example: 60
 *         totalSpent:
 *           type: integer
 *           description: Lifetime credits spent on connection requests.
 *           example: 13
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreditTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d5e
 *         userId:
 *           type: string
 *           example: 664f1b2c3d4e5f6a7b8c9d0e
 *         type:
 *           type: string
 *           enum: [purchase, spend, earn, cashback, refund]
 *           example: purchase
 *         amount:
 *           type: integer
 *           description: Credits involved. Always positive — direction is implied by type.
 *           example: 10
 *         balanceBefore:
 *           type: integer
 *           description: Wallet balance immediately before this transaction.
 *           example: 37
 *         balanceAfter:
 *           type: integer
 *           description: Wallet balance immediately after this transaction.
 *           example: 47
 *         description:
 *           type: string
 *           example: "Purchased Starter Pack - 10 credits"
 *         referenceId:
 *           type: string
 *           nullable: true
 *           description: ID of the related document (CreditPackage, Connection, or Registration).
 *           example: 664f1b2c3d4e5f6a7b8c9d6f
 *         referenceModel:
 *           type: string
 *           nullable: true
 *           enum: [CreditPackage, Connection, Registration]
 *           example: CreditPackage
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Flexible extra data such as payment reference or attendee name.
 *           example:
 *             paymentRef: "pay_abc123xyz"
 *             packageName: Starter Pack
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/wallet/me:
 *   get:
 *     tags: [Wallet]
 *     summary: Get own wallet
 *     description: Returns the authenticated user's wallet balance and lifetime credit stats.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved
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
 *                   example: Wallet retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/wallet/me/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get own transaction history
 *     description: Returns a paginated list of all credit transactions for the authenticated user, sorted newest first. Transactions are immutable — they are never updated or deleted.
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       200:
 *         description: Transaction history retrieved
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
 *                   example: Transaction history retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CreditTransaction'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/wallet/purchase/initiate:
 *   post:
 *     tags: [Wallet]
 *     summary: Initiate a credit package purchase
 *     description: >
 *       User only. Validates the selected credit package and initialises a payment transaction via the connected payment gateway.
 *       Store the returned payment reference and redirect the user to the payment URL.
 *       On successful payment the gateway will POST to /api/v1/wallet/purchase/callback to credit the wallet automatically.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [packageId]
 *             properties:
 *               packageId:
 *                 type: string
 *                 description: ID of the credit package to purchase. Must be an active package.
 *                 example: 664f1b2c3d4e5f6a7b8c9d7g
 *     responses:
 *       200:
 *         description: Payment initialised. Redirect user to the returned payment URL.
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
 *                   example: Payment initialized
 *                 data:
 *                   type: object
 *                   description: Payment gateway response. Shape depends on your payment provider.
 *                   properties:
 *                     package:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 664f1b2c3d4e5f6a7b8c9d7g
 *                         name:
 *                           type: string
 *                           example: Starter Pack
 *                         credits:
 *                           type: integer
 *                           example: 10
 *                         price:
 *                           type: number
 *                           example: 2500
 *                         currency:
 *                           type: string
 *                           example: NGN
 *       400:
 *         description: Package is inactive or unavailable
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
 */

/**
 * @swagger
 * /api/v1/wallet/purchase/callback:
 *   post:
 *     tags: [Wallet]
 *     summary: Payment gateway webhook
 *     description: >
 *       Public endpoint called by the payment gateway after a successful payment.
 *       Authentication is performed via gateway signature verification, not a user JWT.
 *       Do not call this endpoint directly from your frontend.
 *       The request body shape matches your payment provider's webhook payload.
 *       On success the user's wallet is credited and a CreditTransaction record is written atomically.
 *       Always returns 200 to acknowledge receipt, even on business logic errors, to prevent the gateway from retrying and causing duplicate credits.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payment gateway webhook payload. Shape varies by provider.
 *             properties:
 *               event:
 *                 type: string
 *                 description: Gateway event name. The handler processes charge.success and payment.success events.
 *                 example: charge.success
 *               data:
 *                 type: object
 *                 properties:
 *                   reference:
 *                     type: string
 *                     description: Payment reference from the gateway.
 *                     example: pay_abc123xyz
 *                   metadata:
 *                     type: object
 *                     description: Must contain userId and packageId set at payment initialisation time.
 *                     required: [userId, packageId]
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: 664f1b2c3d4e5f6a7b8c9d0e
 *                       packageId:
 *                         type: string
 *                         example: 664f1b2c3d4e5f6a7b8c9d7g
 *     responses:
 *       200:
 *         description: Webhook acknowledged
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
 *                   example: Webhook processed
 */
