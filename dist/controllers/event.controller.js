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
exports.getMyEvents = exports.publishEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const error_1 = require("../middleware/error");
const eventService = __importStar(require("../services/event.service"));
exports.createEvent = (0, error_1.asyncHandler)(async (req, res) => {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.data({ event }, 'Event created successfully', 201);
});
exports.getEvents = (0, error_1.asyncHandler)(async (req, res) => {
    const { page, limit, search } = req.query;
    const result = await eventService.getEvents({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        search: search,
    });
    res.data(result, 'Events retrieved');
});
exports.getEventById = (0, error_1.asyncHandler)(async (req, res) => {
    const event = await eventService.getEventById(req.params.eventId);
    res.data({ event }, 'Event retrieved');
});
exports.updateEvent = (0, error_1.asyncHandler)(async (req, res) => {
    const event = await eventService.updateEvent(req.user.id, req.params.eventId, req.body);
    res.data({ event }, 'Event updated');
});
exports.publishEvent = (0, error_1.asyncHandler)(async (req, res) => {
    const event = await eventService.publishEvent(req.user.id, req.params.eventId);
    res.data({ event }, 'Event published successfully');
});
exports.getMyEvents = (0, error_1.asyncHandler)(async (req, res) => {
    const events = await eventService.getOrganiserEvents(req.user.id);
    res.data({ events }, 'Your events retrieved');
});
//# sourceMappingURL=event.controller.js.map