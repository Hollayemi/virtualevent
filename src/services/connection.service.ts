import Connection from '../models/Connection.model';
import Registration from '../models/Registration.model';
import Event from '../models/Event.model';
import User from '../models/User.model';
import { AppError } from '../middleware/error';
import { IntentionTag } from '../utils/constants';
import mongoose from 'mongoose';
import * as walletService from '../services/wallet.service';
import { getConfig } from './creditConfig.service';
import { bucketTier } from '../helpers/tier';
import { getInitials, getColorForId } from '../helpers/avatar';

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
    let creditCost = 0;
    let wasVipGated = false;

    if (requesterReg.tierPrice < recipientReg.tierPrice) {
        const requesterBalance = (await walletService.getOrCreateWallet(requesterId)).balance

        if (requesterBalance < recipientReg.tierPrice) {
            throw new AppError(
                'Insufficient Balance to send connection request',
                403,
                'FORBIDDEN',
            );

        }

        const event = await Event.findById(eventId).select('name').lean();

        await walletService.debitWallet(
            requesterId,
            recipientReg.tierPrice,
            {
                type: "spend",
                description: `Connection request to a ${recipientReg.tierLabel} attendee`,
                source: "connection_request",
                eventId,
                eventName: event?.name,
            }
        )

        creditCost = recipientReg.tierPrice;
        wasVipGated = true;
    }


    const connection = await Connection.create({
        eventId,
        requesterId,
        recipientId,
        requesterTierId: requesterReg.tierId,
        recipientTierId: recipientReg.tierId,
        creditCost,
        wasVipGated,
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

// ══════════════════════════════════════════════════════════════════════════
// connection.slice.ts — new flat API surface
// (listConnections / received / sent / stats / pending-count / request /
// accept / decline / cancel). These map onto the SAME Connection model as
// the event-nested functions above — see GAP_ANALYSIS.md → "Connection
// module" for why both exist and which one the frontend now expects.
// ══════════════════════════════════════════════════════════════════════════

const USER_POPULATE = {
    path: 'requesterId recipientId',
} as const;

const populateConnectionParties = (query: any) =>
    query
        .populate({
            path: 'requesterId',
            select: 'name email avatarUrl attendeeProfile',
            populate: { path: 'attendeeProfile', select: 'role company industry' },
        })
        .populate({
            path: 'recipientId',
            select: 'name email avatarUrl attendeeProfile',
            populate: { path: 'attendeeProfile', select: 'role company industry' },
        })
        .populate({
            path: 'eventId',
            select: 'name slug startDate organiserId',
            populate: { path: 'organiserId', select: 'organisationName logoUrl' },
        });

/** Builds a tierId -> {isVIP, price} map for every event referenced in a batch of connections. */
const buildTierMapsByEvent = async (eventIds: string[]) => {
    const uniqueIds = [...new Set(eventIds)];
    const events = await Event.find({ _id: { $in: uniqueIds } }).select('tiers').lean();
    const byEvent = new Map<string, Map<string, { isVIP: boolean; price: number }>>();
    events.forEach((ev: any) => {
        const tierMap = new Map<string, { isVIP: boolean; price: number }>();
        (ev.tiers || []).forEach((t: any) => tierMap.set(t.tierId, { isVIP: t.isVIP, price: t.price }));
        byEvent.set(ev._id.toString(), tierMap);
    });
    return byEvent;
};

const serializeConnectionUser = (user: any, tierId: string, tierMap?: Map<string, { isVIP: boolean; price: number }>) => {
    if (!user) return null;
    const attendee = user.attendeeProfile ?? {};
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        initials: getInitials(user.name),
        color: getColorForId(user._id?.toString?.() ?? String(user._id)),
        role: attendee.role ?? '',
        company: attendee.company ?? '',
        industry: attendee.industry ?? '',
        tier: bucketTier(tierMap?.get(tierId)),
        avatarUrl: user.avatarUrl,
    };
};

const serializeConnection = (
    conn: any,
    tierMapsByEvent: Map<string, Map<string, { isVIP: boolean; price: number }>>,
) => {
    const eventId = (conn.eventId?._id ?? conn.eventId)?.toString();
    const tierMap = tierMapsByEvent.get(eventId);
    const organiser = conn.eventId?.organiserId;

    return {
        _id: conn._id,
        from: serializeConnectionUser(conn.requesterId, conn.requesterTierId, tierMap),
        to: serializeConnectionUser(conn.recipientId, conn.recipientTierId, tierMap),
        event: conn.eventId
            ? {
                  _id: conn.eventId._id,
                  name: conn.eventId.name,
                  slug: conn.eventId.slug,
                  startDate: conn.eventId.startDate,
                  organiserId: organiser
                      ? {
                            _id: organiser._id,
                            name: organiser.organisationName,
                            organisationName: organiser.organisationName,
                            logoUrl: organiser.logoUrl,
                        }
                      : undefined,
              }
            : undefined,
        intent: conn.intentionTag,
        status: conn.status,
        viaCredits: (conn.creditCost ?? 0) > 0,
        creditsCost: conn.creditCost ?? 0,
        message: conn.message,
        connectedAt: conn.status === 'accepted' ? conn.updatedAt : undefined,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
    };
};

const serializeMany = async (docs: any[]) => {
    const tierMaps = await buildTierMapsByEvent(docs.map((d) => (d.eventId?._id ?? d.eventId)?.toString()));
    return docs.map((d) => serializeConnection(d, tierMaps));
};

export interface ListConnectionsParams {
    eventId?: string;
    status?: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'all';
    tab?: 'connections' | 'received' | 'sent';
    page?: number;
    pageSize?: number;
}

const buildTabFilter = (userId: string, tab?: ListConnectionsParams['tab']) => {
    const uid = new mongoose.Types.ObjectId(userId);
    if (tab === 'received') return { recipientId: uid };
    if (tab === 'sent') return { requesterId: uid };
    return { $or: [{ requesterId: uid }, { recipientId: uid }] };
};

/** GET /connections */
export const listConnections = async (userId: string, params: ListConnectionsParams) => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const filter: Record<string, any> = { ...buildTabFilter(userId, params.tab) };
    if (params.eventId) filter.eventId = params.eventId;
    if (params.status && params.status !== 'all') filter.status = params.status;

    const query = populateConnectionParties(
        Connection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    );
    const [docs, total] = await Promise.all([query.lean(), Connection.countDocuments(filter)]);

    return {
        data: await serializeMany(docs),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

/** GET /connections/received — pending requests sent TO this user */
export const getReceivedConnections = async (
    userId: string,
    params: { eventId?: string; page?: number; pageSize?: number },
) => {
    return listConnections(userId, {
        ...params,
        tab: 'received',
        status: 'pending',
    });
};

/** GET /connections/sent — pending requests this user sent */
export const getSentConnections = async (
    userId: string,
    params: { eventId?: string; page?: number; pageSize?: number },
) => {
    return listConnections(userId, {
        ...params,
        tab: 'sent',
        status: 'pending',
    });
};

/** GET /connections/stats */
export const getConnectionsStats = async (userId: string, eventId?: string) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const match: Record<string, any> = { $or: [{ requesterId: uid }, { recipientId: uid }] };
    if (eventId) match.eventId = new mongoose.Types.ObjectId(eventId);

    const [rows, byEventAgg] = await Promise.all([
        Connection.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                    pending: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$status', 'pending'] }, { $eq: ['$recipientId', uid] }] },
                                1,
                                0,
                            ],
                        },
                    },
                    sent: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$status', 'pending'] }, { $eq: ['$requesterId', uid] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
        Connection.aggregate([
            { $match: { ...match, status: 'accepted' } },
            { $group: { _id: '$eventId', count: { $sum: 1 } } },
            { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $project: { eventId: '$_id', eventName: '$event.name', count: 1, _id: 0 } },
        ]),
    ]);

    const summary = rows[0] ?? { total: 0, accepted: 0, pending: 0, sent: 0 };
    const acceptanceRate = summary.total > 0 ? Math.round((summary.accepted / summary.total) * 100) / 100 : 0;

    return {
        total: summary.total,
        accepted: summary.accepted,
        pending: summary.pending,
        sent: summary.sent,
        acceptanceRate,
        byEvent: byEventAgg,
    };
};

/** GET /connections/pending-count */
export const getPendingCount = async (userId: string, eventId?: string) => {
    const match: Record<string, any> = { recipientId: userId, status: 'pending' };
    if (eventId) match.eventId = eventId;
    const count = await Connection.countDocuments(match);
    return { count };
};

export interface FlatConnectionRequestInput {
    requesterId: string;
    userId: string;    // recipient — matches connection.slice.ts ConnectionRequest.userId
    eventId: string;
    intent: IntentionTag;
    message?: string;
}

/**
 * POST /connections/request — flat request shape.
 * Reuses the same tier-gate / wallet-debit logic as the event-nested
 * sendConnectionRequest, then returns the ConnectionResponse shape.
 */
export const sendFlatConnectionRequest = async (input: FlatConnectionRequestInput) => {
    const connection = await sendConnectionRequest({
        requesterId: input.requesterId,
        recipientId: input.userId,
        eventId: input.eventId,
        intentionTag: input.intent,
        message: input.message,
    });

    return {
        connectionId: connection._id.toString(),
        status: connection.status,
        creditsSpent: connection.creditCost,
    };
};

/** POST /connections/:connectionId/accept */
export const acceptConnectionFlat = async (userId: string, connectionId: string) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    if (connection.recipientId.toString() !== userId) {
        throw new AppError('Not authorised to respond to this connection request', 403, 'FORBIDDEN');
    }
    if (connection.status !== 'pending') {
        throw new AppError(`Connection request has already been ${connection.status}`, 400);
    }

    await connection.accept();

    // Cashback: if this request was VIP-gated (credits were spent), pay the
    // recipient a cashback share now that they've accepted.
    let creditsEarned = 0;
    if (connection.wasVipGated && connection.creditCost > 0) {
        const config = await getConfig();
        creditsEarned = Math.floor(connection.creditCost * config.cashbackRatio);

        if (creditsEarned > 0) {
            const event = await Event.findById(connection.eventId).select('name').lean();
            await walletService.creditWallet(userId, creditsEarned, {
                type: 'cashback',
                description: `Cashback for accepting a connection request`,
                referenceId: connection._id.toString(),
                referenceModel: 'Connection',
                source: 'connection_accept',
                eventId: connection.eventId.toString(),
                eventName: event?.name,
            });
        }
    }

    return {
        connectionId: connection._id.toString(),
        status: 'accepted' as const,
        creditsEarned,
        connectedAt: connection.updatedAt.toISOString(),
    };
};

/** POST /connections/:connectionId/decline */
export const declineConnectionFlat = async (userId: string, connectionId: string) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    if (connection.recipientId.toString() !== userId) {
        throw new AppError('Not authorised to respond to this connection request', 403, 'FORBIDDEN');
    }
    if (connection.status !== 'pending') {
        throw new AppError(`Connection request has already been ${connection.status}`, 400);
    }

    await connection.decline();

    return { connectionId: connection._id.toString(), status: 'declined' as const };
};

/** POST /connections/:connectionId/cancel — requester withdraws their own pending request */
export const cancelConnectionRequest = async (userId: string, connectionId: string) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    if (connection.requesterId.toString() !== userId) {
        throw new AppError('Not authorised to cancel this connection request', 403, 'FORBIDDEN');
    }
    if (connection.status !== 'pending') {
        throw new AppError(`Connection request has already been ${connection.status}`, 400);
    }

    // Refund any credits spent to send this request.
    if (connection.wasVipGated && connection.creditCost > 0) {
        const event = await Event.findById(connection.eventId).select('name').lean();
        await walletService.creditWallet(userId, connection.creditCost, {
            type: 'refund',
            description: 'Refund for a cancelled connection request',
            referenceId: connection._id.toString(),
            referenceModel: 'Connection',
            source: 'refund',
            eventId: connection.eventId.toString(),
            eventName: event?.name,
        });
    }

    await connection.cancel();

    return { connectionId: connection._id.toString(), status: 'cancelled' as const };
};

