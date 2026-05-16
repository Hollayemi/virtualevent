"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.browseAttendeesInTier = exports.getEventConnections = exports.respondToConnection = exports.sendConnectionRequest = void 0;
const Connection_model_1 = __importDefault(require("../models/Connection.model"));
const Registration_model_1 = __importDefault(require("../models/Registration.model"));
const error_1 = require("../middleware/error");
const mongoose_1 = __importDefault(require("mongoose"));
const sendConnectionRequest = async (input) => {
    const { requesterId, recipientId, eventId, intentionTag, message } = input;
    if (requesterId === recipientId) {
        throw new error_1.AppError('You cannot send a connection request to yourself', 400);
    }
    // Fetch both registrations in a single query
    const [requesterReg, recipientReg] = await Promise.all([
        Registration_model_1.default.findOne({ userId: requesterId, eventId, status: 'confirmed' }),
        Registration_model_1.default.findOne({ userId: recipientId, eventId, status: 'confirmed' }),
    ]);
    if (!requesterReg) {
        throw new error_1.AppError('You must be a confirmed attendee of this event to connect', 403, 'FORBIDDEN');
    }
    if (!recipientReg) {
        throw new error_1.AppError('This attendee is not a confirmed participant of the event', 400);
    }
    // Tier gate: both must share the same tierId
    if (requesterReg.tierId !== recipientReg.tierId) {
        throw new error_1.AppError('You can only connect with attendees in your tier', 403, 'FORBIDDEN');
    }
    // Duplicate guard (also enforced by DB unique index, but gives a friendly message)
    const existingConnection = await Connection_model_1.default.findOne({
        eventId,
        $or: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
        ],
    });
    if (existingConnection) {
        throw new error_1.AppError('A connection request already exists between you and this attendee', 409, 'CONFLICT');
    }
    const connection = await Connection_model_1.default.create({
        eventId,
        requesterId,
        recipientId,
        requesterTierId: requesterReg.tierId,
        recipientTierId: recipientReg.tierId,
        intentionTag,
        message,
    });
    return connection.populate([
        { path: 'requesterId', select: 'name email avatarUrl company role' },
        { path: 'recipientId', select: 'name email avatarUrl company role' },
    ]);
};
exports.sendConnectionRequest = sendConnectionRequest;
const respondToConnection = async (userId, connectionId, action) => {
    const connection = await Connection_model_1.default.findById(connectionId);
    if (!connection) {
        throw new error_1.AppError('Connection request not found', 404, 'NOT_FOUND');
    }
    // Only the recipient can respond
    if (connection.recipientId.toString() !== userId) {
        throw new error_1.AppError('Not authorised to respond to this connection request', 403, 'FORBIDDEN');
    }
    if (connection.status !== 'pending') {
        throw new error_1.AppError(`Connection request has already been ${connection.status}`, 400);
    }
    if (action === 'accept') {
        await connection.accept();
    }
    else {
        await connection.decline();
    }
    return connection.populate([
        { path: 'requesterId', select: 'name email avatarUrl company role' },
        { path: 'recipientId', select: 'name email avatarUrl company role' },
    ]);
};
exports.respondToConnection = respondToConnection;
const getEventConnections = async (userId, eventId) => {
    // Verify user is a confirmed attendee
    const reg = await Registration_model_1.default.findOne({ userId, eventId, status: 'confirmed' });
    if (!reg) {
        throw new error_1.AppError('You are not a confirmed attendee of this event', 403, 'FORBIDDEN');
    }
    const connections = await Connection_model_1.default.find({
        eventId,
        $or: [{ requesterId: userId }, { recipientId: userId }],
    })
        .populate('requesterId', 'name email avatarUrl company role industry')
        .populate('recipientId', 'name email avatarUrl company role industry')
        .sort({ createdAt: -1 })
        .lean();
    return connections;
};
exports.getEventConnections = getEventConnections;
const browseAttendeesInTier = async (userId, eventId) => {
    // Find the requesting user's confirmed registration to get their tierId
    const myReg = await Registration_model_1.default.findOne({ userId, eventId, status: 'confirmed' });
    if (!myReg) {
        throw new error_1.AppError('You must be a confirmed attendee to browse this event', 403, 'FORBIDDEN');
    }
    // Find all confirmed registrations in the same tier, excluding self
    const registrations = await Registration_model_1.default.find({
        eventId,
        tierId: myReg.tierId,
        status: 'confirmed',
        userId: { $ne: new mongoose_1.default.Types.ObjectId(userId) },
    })
        .populate('userId', 'name email avatarUrl company role industry bio interests networkingGoals')
        .lean();
    // Find all existing connection IDs involving this user in this event
    const connections = await Connection_model_1.default.find({
        eventId,
        $or: [{ requesterId: userId }, { recipientId: userId }],
    })
        .select('requesterId recipientId status')
        .lean();
    // Build a set of connected user IDs for quick lookup
    const connectedMap = new Map();
    connections.forEach((c) => {
        const otherId = c.requesterId.toString() === userId
            ? c.recipientId.toString()
            : c.requesterId.toString();
        connectedMap.set(otherId, c.status);
    });
    // Annotate each attendee with connection status
    const attendees = registrations.map((reg) => {
        const attendeeId = reg.userId._id.toString();
        return {
            ...reg.userId,
            connectionStatus: connectedMap.get(attendeeId) ?? 'none',
            tierId: reg.tierId,
            tierLabel: reg.tierLabel,
        };
    });
    return attendees;
};
exports.browseAttendeesInTier = browseAttendeesInTier;
//# sourceMappingURL=connection.service.js.map