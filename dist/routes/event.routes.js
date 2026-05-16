"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController = __importStar(require("../controllers/event.controller"));
const registrationController = __importStar(require("../controllers/registration.controller"));
const connectionController = __importStar(require("../controllers/connection.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validation_schemas_1 = require("../helpers/validation.schemas");
const router = (0, express_1.Router)();
//  Public Event Routes 
router.get('/', auth_1.ifToken, eventController.getEvents);
router.get('/:eventId', auth_1.ifToken, eventController.getEventById);
//  Organiser-only Event Management 
router.post('/', auth_1.protect, (0, auth_1.requireAccountType)('organiser'), (0, validate_1.validate)(validation_schemas_1.createEventSchema), eventController.createEvent);
router.patch('/:eventId', auth_1.protect, (0, auth_1.requireAccountType)('organiser'), (0, validate_1.validate)(validation_schemas_1.updateEventSchema), eventController.updateEvent);
router.patch('/:eventId/publish', auth_1.protect, (0, auth_1.requireAccountType)('organiser'), eventController.publishEvent);
//  Registrations 
// User registers for an event
router.post('/:eventId/register', auth_1.protect, (0, auth_1.requireAccountType)('user'), (0, validate_1.validate)(validation_schemas_1.registerForEventSchema), registrationController.registerForEvent);
// Organiser views all registrations for their event
router.get('/:eventId/registrations', auth_1.protect, (0, auth_1.requireAccountType)('organiser'), registrationController.getEventRegistrations);
//  Connections (user-only, must be confirmed attendee) 
router.post('/:eventId/connections', auth_1.protect, (0, auth_1.requireAccountType)('user'), (0, validate_1.validate)(validation_schemas_1.sendConnectionSchema), connectionController.sendConnectionRequest);
router.get('/:eventId/connections', auth_1.protect, (0, auth_1.requireAccountType)('user'), connectionController.getEventConnections);
router.get('/:eventId/attendees', auth_1.protect, (0, auth_1.requireAccountType)('user'), connectionController.browseAttendeesInTier);
exports.default = router;
//# sourceMappingURL=event.routes.js.map