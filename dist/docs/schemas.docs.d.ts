/**
 * @swagger
 * components:
 *   schemas:
 *
 *     # ─── Generic Responses ───────────────────────────────────────────────
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Something went wrong
 *         code:
 *           type: string
 *           example: NOT_FOUND
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
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         totalPages:
 *           type: integer
 *           example: 3
 *
 *     # ─── Auth ─────────────────────────────────────────────────────────────
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: alice@example.com
 *         password:
 *           type: string
 *           example: Password123!
 *
 *     # ─── User ─────────────────────────────────────────────────────────────
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7a8b9c0d1
 *         name:
 *           type: string
 *           example: Alice Smith
 *         email:
 *           type: string
 *           format: email
 *           example: alice@example.com
 *         phone:
 *           type: string
 *           example: "+447700900123"
 *         bio:
 *           type: string
 *           example: Founder and product builder.
 *         role:
 *           type: string
 *           example: Software Engineer
 *         company:
 *           type: string
 *           example: Acme Corp
 *         industry:
 *           type: string
 *           example: Technology
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: [AI, Web3, Climate]
 *         networkingGoals:
 *           type: string
 *           example: Find co-founders
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         isVerified:
 *           type: boolean
 *           example: false
 *         accountType:
 *           type: string
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: Alice Smith
 *         email:
 *           type: string
 *           format: email
 *           example: alice@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: Password123!
 *         phone:
 *           type: string
 *           example: "+447700900123"
 *         bio:
 *           type: string
 *         role:
 *           type: string
 *           example: Software Engineer
 *         company:
 *           type: string
 *           example: Acme Corp
 *         industry:
 *           type: string
 *           example: Technology
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         networkingGoals:
 *           type: string
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         bio:
 *           type: string
 *         role:
 *           type: string
 *         company:
 *           type: string
 *         industry:
 *           type: string
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         networkingGoals:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           format: uri
 *
 *     # ─── Organiser ────────────────────────────────────────────────────────
 *
 *     OrganiserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           example: Bob Jones
 *         email:
 *           type: string
 *           format: email
 *         organisationName:
 *           type: string
 *           example: TechConf Ltd
 *         organisationDescription:
 *           type: string
 *         logoUrl:
 *           type: string
 *           format: uri
 *         website:
 *           type: string
 *           format: uri
 *           example: https://techconf.com
 *         phone:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         accountType:
 *           type: string
 *           example: organiser
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterOrganiserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - organisationName
 *       properties:
 *         name:
 *           type: string
 *           example: Bob Jones
 *         email:
 *           type: string
 *           format: email
 *           example: bob@events.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: Secret@123
 *         organisationName:
 *           type: string
 *           example: TechConf Ltd
 *         organisationDescription:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *           example: https://techconf.com
 *         phone:
 *           type: string
 *
 *     UpdateOrganiserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         organisationName:
 *           type: string
 *         organisationDescription:
 *           type: string
 *         logoUrl:
 *           type: string
 *           format: uri
 *         website:
 *           type: string
 *           format: uri
 *         phone:
 *           type: string
 *
 *     # ─── Event ────────────────────────────────────────────────────────────
 *
 *     Location:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [physical, virtual, hybrid]
 *           example: physical
 *         address:
 *           type: string
 *           example: 1 Tech Street
 *         city:
 *           type: string
 *           example: London
 *         virtualLink:
 *           type: string
 *           format: uri
 *
 *     Tier:
 *       type: object
 *       properties:
 *         tierId:
 *           type: string
 *         label:
 *           type: string
 *           example: Founders Pass
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           example: 99
 *         capacity:
 *           type: integer
 *           example: 100
 *         isVIP:
 *           type: boolean
 *         color:
 *           type: string
 *           example: "#7C3AED"
 *
 *     TierInput:
 *       type: object
 *       required:
 *         - label
 *         - price
 *       properties:
 *         label:
 *           type: string
 *           example: Founders Pass
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 99
 *         capacity:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: 0 means unlimited
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-Fa-f]{6}$'
 *           example: "#7C3AED"
 *
 *     CustomFieldInput:
 *       type: object
 *       required:
 *         - fieldKey
 *         - label
 *         - type
 *       properties:
 *         fieldKey:
 *           type: string
 *           example: linkedinUrl
 *           description: Alphanumeric + underscores only. Must be unique within the event.
 *         label:
 *           type: string
 *           example: LinkedIn Profile
 *         type:
 *           type: string
 *           enum: [text, textarea, select, checkbox, url, number]
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Required when type is "select"
 *         isRequired:
 *           type: boolean
 *           default: false
 *         placeholder:
 *           type: string
 *
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         organiserId:
 *           type: string
 *         name:
 *           type: string
 *           example: Startup Founders Summit
 *         description:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         bannerUrl:
 *           type: string
 *           format: uri
 *         status:
 *           type: string
 *           enum: [draft, published, ended]
 *         tiers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tier'
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomFieldInput'
 *         totalRegistrations:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateEventRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - startDate
 *         - endDate
 *         - location
 *         - tiers
 *       properties:
 *         name:
 *           type: string
 *           example: Startup Founders Summit
 *         description:
 *           type: string
 *           example: Annual networking event for early-stage founders.
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T09:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T18:00:00.000Z"
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         bannerUrl:
 *           type: string
 *           format: uri
 *         tiers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/TierInput'
 *           description: Each tier must have a unique price.
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomFieldInput'
 *
 *     UpdateEventRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         bannerUrl:
 *           type: string
 *           format: uri
 *         tiers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/TierInput'
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomFieldInput'
 *
 *     # ─── Registration ──────────────────────────────────────────────────────
 *
 *     Registration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         eventId:
 *           type: string
 *         tierId:
 *           type: string
 *         tierLabel:
 *           type: string
 *           example: Founders Pass
 *         tierPrice:
 *           type: number
 *           example: 99
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         customFieldValues:
 *           type: object
 *           additionalProperties: true
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterForEventRequest:
 *       type: object
 *       required:
 *         - tierId
 *       properties:
 *         tierId:
 *           type: string
 *           example: a1b2c3d4-uuid-of-tier
 *         customFieldValues:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             linkedinUrl: https://linkedin.com/in/alice
 *             dietaryRequirements: vegan
 *
 *     # ─── Connection ────────────────────────────────────────────────────────
 *
 *     Connection:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         requesterId:
 *           $ref: '#/components/schemas/UserProfile'
 *         recipientId:
 *           $ref: '#/components/schemas/UserProfile'
 *         requesterTierId:
 *           type: string
 *         recipientTierId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined]
 *         intentionTag:
 *           type: string
 *           enum: [Hiring, Investment, Partnership, Mentorship, Sales, Collaboration]
 *         message:
 *           type: string
 *           example: "Let's collaborate on your next project!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SendConnectionRequest:
 *       type: object
 *       required:
 *         - recipientId
 *         - intentionTag
 *       properties:
 *         recipientId:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7a8b9c0d2
 *         intentionTag:
 *           type: string
 *           enum: [Hiring, Investment, Partnership, Mentorship, Sales, Collaboration]
 *           example: Partnership
 *         message:
 *           type: string
 *           maxLength: 300
 *           example: "Let's collaborate on your next project!"
 *
 *     RespondConnectionRequest:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         action:
 *           type: string
 *           enum: [accept, decline]
 *           example: accept
 */
//# sourceMappingURL=schemas.docs.d.ts.map