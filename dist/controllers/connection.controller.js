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
exports.browseAttendeesInTier = exports.respondToConnection = exports.getEventConnections = exports.sendConnectionRequest = void 0;
const error_1 = require("../middleware/error");
const connectionService = __importStar(require("../services/connection.service"));
exports.sendConnectionRequest = (0, error_1.asyncHandler)(async (req, res) => {
    const connection = await connectionService.sendConnectionRequest({
        requesterId: req.user.id,
        eventId: req.params.eventId,
        ...req.body,
    });
    res.data({ connection }, 'Connection request sent', 201);
});
exports.getEventConnections = (0, error_1.asyncHandler)(async (req, res) => {
    const connections = await connectionService.getEventConnections(req.user.id, req.params.eventId);
    res.data({ connections }, 'Connections retrieved');
});
exports.respondToConnection = (0, error_1.asyncHandler)(async (req, res) => {
    const connection = await connectionService.respondToConnection(req.user.id, req.params.connectionId, req.body.action);
    res.data({ connection }, `Connection request ${req.body.action}ed`);
});
exports.browseAttendeesInTier = (0, error_1.asyncHandler)(async (req, res) => {
    const attendees = await connectionService.browseAttendeesInTier(req.user.id, req.params.eventId);
    res.data({ attendees }, 'Attendees retrieved');
});
//# sourceMappingURL=connection.controller.js.map