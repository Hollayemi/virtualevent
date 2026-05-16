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
exports.cancelRegistration = exports.getMyRegistrations = exports.getEventRegistrations = exports.registerForEvent = void 0;
const error_1 = require("../middleware/error");
const registrationService = __importStar(require("../services/registration.service"));
exports.registerForEvent = (0, error_1.asyncHandler)(async (req, res) => {
    const registration = await registrationService.registerForEvent({
        userId: req.user.id,
        eventId: req.params.eventId,
        ...req.body,
    });
    res.data({ registration }, 'Successfully registered for event', 201);
});
exports.getEventRegistrations = (0, error_1.asyncHandler)(async (req, res) => {
    const registrations = await registrationService.getEventRegistrations(req.params.eventId, req.user.id);
    res.data({ registrations }, 'Registrations retrieved');
});
exports.getMyRegistrations = (0, error_1.asyncHandler)(async (req, res) => {
    const registrations = await registrationService.getUserRegistrations(req.user.id);
    res.data({ registrations }, 'Your registrations retrieved');
});
exports.cancelRegistration = (0, error_1.asyncHandler)(async (req, res) => {
    const registration = await registrationService.cancelRegistration(req.user.id, req.params.registrationId);
    res.data({ registration }, 'Registration cancelled');
});
//# sourceMappingURL=registration.controller.js.map