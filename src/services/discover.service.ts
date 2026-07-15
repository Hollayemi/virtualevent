import mongoose from 'mongoose';
import Registration from '../models/Registration.model';
import Connection from '../models/Connection.model';
import Event from '../models/Event.model';
import { AppError } from '../middleware/error';
import { bucketTier } from '../helpers/tier';
import { getInitials, getColorForId } from '../helpers/avatar';

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Resolves the current confirmed registration for a user in an event, or throws. */
const requireConfirmedRegistration = async (userId: string, eventId: string) => {
    const reg = await Registration.findOne({ userId, eventId, status: 'confirmed' });
    if (!reg) {
        throw new AppError('You must be a confirmed attendee of this event to use Discover', 403, 'FORBIDDEN');
    }
    return reg;
};

/** Builds a userId -> connectionStatus lookup for everyone connected (in any state) to `userId` within an event. */
const buildConnectionStatusMap = async (userId: string, eventId: string) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const connections = await Connection.find({
        eventId,
        $or: [{ requesterId: uid }, { recipientId: uid }],
    })
        .select('requesterId recipientId status')
        .lean();

    const map = new Map<string, 'none' | 'pending' | 'connected'>();
    connections.forEach((c) => {
        const otherId = c.requesterId.toString() === userId ? c.recipientId.toString() : c.requesterId.toString();
        if (c.status === 'accepted') map.set(otherId, 'connected');
        else if (c.status === 'pending' && !map.has(otherId)) map.set(otherId, 'pending');
    });
    return map;
};

const serializeAttendee = (
    reg: any,
    tierMap: Map<string, { isVIP: boolean; price: number }>,
    connectionMap: Map<string, 'none' | 'pending' | 'connected'>,
    eventId?: string,
) => {
    const user = reg.userId as any;
    const attendee = user?.attendeeProfile ?? {};
    const id = user?._id?.toString();

    return {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        initials: getInitials(user?.name),
        color: getColorForId(id),
        role: attendee.role ?? '',
        company: attendee.company ?? '',
        industry: attendee.industry ?? '',
        tier: bucketTier(tierMap.get(reg.tierId)),
        interests: attendee.interests ?? [],
        avatarUrl: user?.avatarUrl,
        bio: user?.bio,
        isConnected: connectionMap.get(id) === 'connected',
        connectionStatus: connectionMap.get(id) ?? 'none',
        isOrganiser: false,
        eventId,
    };
};

/** Simple, transparent heuristic — NOT a trained model. Documents its own reasoning via matchReason. */
const scoreMatch = (
    me: { industry?: string; interests?: string[] },
    candidate: { industry?: string; interests?: string[] },
): { score: number; reason: string } => {
    const myInterests = new Set((me.interests ?? []).map((i) => i.toLowerCase()));
    const sharedInterests = (candidate.interests ?? []).filter((i) => myInterests.has(i.toLowerCase()));

    let score = 0;
    const reasons: string[] = [];

    if (sharedInterests.length > 0) {
        score += Math.min(sharedInterests.length * 25, 60);
        reasons.push(`shares ${sharedInterests.length} interest${sharedInterests.length > 1 ? 's' : ''} with you (${sharedInterests.slice(0, 3).join(', ')})`);
    }

    if (me.industry && candidate.industry && me.industry.toLowerCase() === candidate.industry.toLowerCase()) {
        score += 30;
        reasons.push(`also works in ${candidate.industry}`);
    }

    score = Math.min(score, 100);

    return {
        score,
        reason: reasons.length ? `Suggested because they ${reasons.join(' and ')}.` : 'Suggested based on shared event attendance.',
    };
};

// ─── Endpoints ────────────────────────────────────────────────────────────────

export interface DiscoverFilters {
    search?: string;
    industry?: string;
    role?: string;
    tier?: 'Regular' | 'Premium' | 'VIP' | 'all';
    interest?: string;
    eventId: string;
    page?: number;
    pageSize?: number;
}

/** GET /discover/attendees */
export const discoverAttendees = async (userId: string, filters: DiscoverFilters) => {
    const { eventId } = filters;
    if (!eventId) throw new AppError('eventId is required', 400);

    await requireConfirmedRegistration(userId, eventId);

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const event = await Event.findById(eventId).select('tiers').lean();
    if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND');

    const tierMap = new Map<string, { isVIP: boolean; price: number }>();
    (event.tiers || []).forEach((t: any) => tierMap.set(t.tierId, { isVIP: t.isVIP, price: t.price }));

    // Tier filter needs to translate the fixed bucket back into concrete tierIds for this event.
    let tierIdFilter: string[] | undefined;
    if (filters.tier && filters.tier !== 'all') {
        tierIdFilter = [...tierMap.entries()]
            .filter(([, t]) => bucketTier(t) === filters.tier)
            .map(([tierId]) => tierId);
    }

    const match: Record<string, any> = {
        eventId,
        status: 'confirmed',
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
    };
    if (tierIdFilter) match.tierId = { $in: tierIdFilter };

    const populateOpts = {
        path: 'userId',
        select: 'name email bio avatarUrl attendeeProfile',
        populate: { path: 'attendeeProfile', select: 'role company industry interests' },
        match: {} as Record<string, any>,
    };

    if (filters.search) {
        populateOpts.match.name = { $regex: filters.search, $options: 'i' };
    }
    // Note: role/industry/interest filters below run on the Attendee sub-document
    // client-side after populate since Mongoose can't $match a populated ref's
    // populated sub-ref in one query without a $lookup pipeline. For large
    // datasets, replace this with an aggregation ($lookup Attendee then User).

    const allRegs = await Registration.find(match).populate(populateOpts).lean();
    let regs = allRegs.filter((r) => r.userId); // populate `match` nulls out non-matching users

    if (filters.industry) {
        regs = regs.filter((r: any) => r.userId?.attendeeProfile?.industry === filters.industry);
    }
    if (filters.role) {
        regs = regs.filter((r: any) => r.userId?.attendeeProfile?.role === filters.role);
    }
    if (filters.interest) {
        regs = regs.filter((r: any) => (r.userId?.attendeeProfile?.interests ?? []).includes(filters.interest));
    }

    const total = regs.length;
    const pageRegs = regs.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    const connectionMap = await buildConnectionStatusMap(userId, eventId);

    return {
        data: pageRegs.map((r) => serializeAttendee(r, tierMap, connectionMap, eventId)),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

/** GET /discover/suggested */
export const getSuggestedAttendees = async (userId: string, params: { eventId: string; limit?: number }) => {
    const { eventId } = params;
    if (!eventId) throw new AppError('eventId is required', 400);

    const myReg = await requireConfirmedRegistration(userId, eventId);
    const myAttendee = await Registration.populate(myReg, {
        path: 'userId',
        select: 'attendeeProfile',
        populate: { path: 'attendeeProfile', select: 'industry interests' },
    });
    const me = (myAttendee.userId as any)?.attendeeProfile ?? {};

    const limit = params.limit ?? 6;

    const event = await Event.findById(eventId).select('tiers').lean();
    const tierMap = new Map<string, { isVIP: boolean; price: number }>();
    (event?.tiers || []).forEach((t: any) => tierMap.set(t.tierId, { isVIP: t.isVIP, price: t.price }));

    const regs = await Registration.find({
        eventId,
        status: 'confirmed',
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
    })
        .populate({
            path: 'userId',
            select: 'name email bio avatarUrl attendeeProfile',
            populate: { path: 'attendeeProfile', select: 'role company industry interests' },
        })
        .lean();

    const connectionMap = await buildConnectionStatusMap(userId, eventId);

    const ranked = regs
        .filter((r) => r.userId && connectionMap.get((r.userId as any)._id.toString()) !== 'connected')
        .map((r) => {
            const candidate = (r.userId as any)?.attendeeProfile ?? {};
            const { score, reason } = scoreMatch(me, candidate);
            return { reg: r, score, reason };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return ranked.map(({ reg, score, reason }) => ({
        ...serializeAttendee(reg, tierMap, connectionMap, eventId),
        matchScore: score,
        matchReason: reason,
    }));
};

/** GET /discover/attendees/:userId */
export const getAttendeeDetail = async (userId: string, params: { userId: string; eventId?: string }) => {
    const { userId: targetUserId, eventId } = params;

    const regQuery: Record<string, any> = { userId: targetUserId, status: 'confirmed' };
    if (eventId) regQuery.eventId = eventId;

    const reg = await Registration.findOne(regQuery)
        .sort({ createdAt: -1 })
        .populate({
            path: 'userId',
            select: 'name email bio avatarUrl attendeeProfile',
            populate: { path: 'attendeeProfile', select: 'role company industry interests' },
        })
        .lean();

    if (!reg) {
        throw new AppError('Attendee not found', 404, 'NOT_FOUND');
    }

    const tierMap = new Map<string, { isVIP: boolean; price: number }>();
    const event = await Event.findById(reg.eventId).select('tiers').lean();
    (event?.tiers || []).forEach((t: any) => tierMap.set(t.tierId, { isVIP: t.isVIP, price: t.price }));

    const connectionMap = await buildConnectionStatusMap(userId, reg.eventId.toString());

    return serializeAttendee(reg, tierMap, connectionMap, reg.eventId.toString());
};

/** GET /discover/filters */
export const getDiscoverFilters = async (eventId: string) => {
    if (!eventId) throw new AppError('eventId is required', 400);

    const regs = await Registration.find({ eventId, status: 'confirmed' })
        .populate({
            path: 'userId',
            select: 'attendeeProfile',
            populate: { path: 'attendeeProfile', select: 'role industry interests' },
        })
        .lean();

    const industries = new Set<string>();
    const roles = new Set<string>();
    const interests = new Set<string>();

    regs.forEach((r: any) => {
        const attendee = r.userId?.attendeeProfile;
        if (attendee?.industry) industries.add(attendee.industry);
        if (attendee?.role) roles.add(attendee.role);
        (attendee?.interests ?? []).forEach((i: string) => interests.add(i));
    });

    return {
        industries: [...industries].sort(),
        roles: [...roles].sort(),
        tiers: ['Regular', 'Premium', 'VIP'],
        interests: [...interests].sort(),
    };
};
