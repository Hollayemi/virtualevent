import Connection from '../models/Connection.model';
import Registration from '../models/Registration.model';
import { AppError } from '../middleware/error';
import { IntentionTag } from '../utils/constants';
import mongoose from 'mongoose';
import * as walletService from '../services/wallet.service';

interface SendConnectionInput {
    requesterId: string;
    recipientId: string;
    eventId: string;
    intentionTag: IntentionTag;
    message?: string;
}

export const sendConnectionRequest = async (input: SendConnectionInput) => {
    const { requesterId, recipientId, eventId, intentionTag, message } = input;

    if (requesterId === recipientId) {
        throw new AppError('You cannot send a connection request to yourself', 400);
    }

    const [requesterReg, recipientReg] = await Promise.all([
        Registration.findOne({ userId: requesterId, eventId, status: 'confirmed' }),
        Registration.findOne({ userId: recipientId, eventId, status: 'confirmed' }),
    ]);

    if (!requesterReg) {
        throw new AppError('You must be a confirmed attendee of this event to connect', 403, 'FORBIDDEN');
    }

    if (!recipientReg) {
        throw new AppError('This attendee is not a confirmed participant of the event', 400);
    }

    
    // Duplicate guard (also enforced by DB unique index, but gives a friendly message)
    const existingConnection = await Connection.findOne({
        eventId,
        $or: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
        ],
    });

    if (existingConnection) {
        throw new AppError(
            'A connection request already exists between you and this attendee',
            409,
            'CONFLICT',
        );
    }

    // Tier gate: both must share the same tierId for free, if higher, deduct from wallet
    if (requesterReg.tierPrice < recipientReg.tierPrice) {
        const requesterBalance = (await walletService.getOrCreateWallet(requesterId)).balance

        if (requesterBalance < recipientReg.tierPrice) {
            throw new AppError(
                'Insufficient Balance to send connection request',
                403,
                'FORBIDDEN',
            );

        }

        await walletService.debitWallet(
            requesterId,
            recipientReg.tierPrice,
            {
                type: "spend",
                "description": "",
                "referenceId" : "",
            }
        )
    }


    const connection = await Connection.create({
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

export const respondToConnection = async (
    userId: string,
    connectionId: string,
    action: 'accept' | 'decline',
) => {
    const connection = await Connection.findById(connectionId);

    if (!connection) {
        throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    }

    // Only the recipient can respond
    if (connection.recipientId.toString() !== userId) {
        throw new AppError('Not authorised to respond to this connection request', 403, 'FORBIDDEN');
    }

    if (connection.status !== 'pending') {
        throw new AppError(
            `Connection request has already been ${connection.status}`,
            400,
        );
    }

    if (action === 'accept') {
        await connection.accept();
    } else {
        await connection.decline();
    }

    return connection.populate([
        { path: 'requesterId', select: 'name email avatarUrl company role' },
        { path: 'recipientId', select: 'name email avatarUrl company role' },
    ]);
};

export const getEventConnections = async (userId: string, eventId: string) => {
    // Verify user is a confirmed attendee
    const reg = await Registration.findOne({ userId, eventId, status: 'confirmed' });
    if (!reg) {
        throw new AppError('You are not a confirmed attendee of this event', 403, 'FORBIDDEN');
    }

    const connections = await Connection.find({
        eventId,
        $or: [{ requesterId: userId }, { recipientId: userId }],
    })
        .populate('requesterId', 'name email avatarUrl company role industry')
        .populate('recipientId', 'name email avatarUrl company role industry')
        .sort({ createdAt: -1 })
        .lean();

    return connections;
};

export const browseAttendees = async (userId: string, eventId: string, inTier: boolean) => {
    // Find the requesting user's confirmed registration to get their tierId
    const myReg = await Registration.findOne({ userId, eventId, status: 'confirmed' });

    if (!myReg) {
        throw new AppError('You must be a confirmed attendee to browse this event', 403, 'FORBIDDEN');
    }

    // Find all confirmed registrations in the same tier, excluding self
    const registrations = await Registration.find({
        eventId,
        ...(inTier ? { tierId: myReg.tierId } : {}),
        status: 'confirmed',
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
    })
        .populate('userId', 'name email avatarUrl company role industry bio interests networkingGoals')
        .lean();

    // Find all existing connection IDs involving this user in this event
    const connections = await Connection.find({
        eventId,
        $or: [{ requesterId: userId }, { recipientId: userId }],
    })
        .select('requesterId recipientId status')
        .lean();

    // Build a set of connected user IDs for quick lookup
    const connectedMap = new Map<string, string>();
    connections.forEach((c) => {
        const otherId =
            c.requesterId.toString() === userId
                ? c.recipientId.toString()
                : c.requesterId.toString();
        connectedMap.set(otherId, c.status);
    });

    // Annotate each attendee with connection status
    const attendees = registrations.map((reg) => {
        const attendeeId = (reg.userId as any)._id.toString();
        return {
            ...(reg.userId as any),
            connectionStatus: connectedMap.get(attendeeId) ?? 'none',
            tierId: reg.tierId,
            tierLabel: reg.tierLabel,
        };
    });

    return attendees;
};

