import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Event Networking Platform API',
            version: '1.0.0',
            description:
                'REST API for the GYNSIS event networking platform. ' +
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
    apis: [path.join(__dirname, '../docs/*.docs.ts'), path.join(__dirname, '../docs/*.docs.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
