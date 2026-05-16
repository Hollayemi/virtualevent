"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Event Networking Platform API',
            version: '1.0.0',
            description: 'REST API for the GYNSIS event networking platform. ' +
                'Two account types: **User** (attendee) and **Organiser**. ' +
                'Authenticate via JWT Bearer token returned from `/login` or `/register`.',
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Development' },
            { url: 'https://your-domain.com', description: 'Production' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Paste the JWT returned from /login or /register.',
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    // Scans all *.docs.ts files in src/docs/
    apis: [path_1.default.join(__dirname, '../docs/*.docs.ts'), path_1.default.join(__dirname, '../docs/*.docs.js')],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map