/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: >
 *         JWT token obtained from /api/v1/users/login or /api/v1/organisers/login.
 *         Pass as: Authorization: Bearer <token>
 *     AdminKey:
 *       type: apiKey
 *       in: header
 *       name: x-admin-key
 *       description: >
 *         Static admin secret key set via the ADMIN_SECRET_KEY environment variable.
 *         Required for all credit package write operations and credit config endpoints.
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         type:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Resource not found
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         type:
 *           type: string
 *           example: validation_error
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Invalid email address
 *         timestamp:
 *           type: string
 *           format: date-time
 */
