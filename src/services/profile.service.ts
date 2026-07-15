import mongoose from 'mongoose';
import User from '../models/User.model';
import Attendee from '../models/Attendee.model';
import Registration from '../models/Registration.model';
import Event from '../models/Event.model';
import { AppError } from '../middleware/error';
import { bucketTier } from '../helpers/tier';
import { getInitials, getColorForId } from '../helpers/avatar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * "Current" tier for a profile: derived from the user's most recent confirmed
 * registration (optionally scoped to a specific eventId). Falls back to
 * 'Regular' if the user has no confirmed registrations — see
 * GAP_ANALYSIS.md → "Tier modeling" for why this is a derived value rather
 * than a stored field.
 */
const resolveCurrentTier = async (userId: string, eventId?: string) => {
    const query: Record<string, any> = { userId, status: 'confirmed' };
    if (eventId) query.eventId = eventId;

    const reg = await Registration.findOne(query).sort({ createdAt: -1 }).lean();
    if (!reg) return { tier: bucketTier(null), reg: null as any };

    const event = await Event.findById(reg.eventId).select('tiers').lean();
    const tierDef = (event?.tiers || []).find((t: any) => t.tierId === reg.tierId);
    return { tier: bucketTier(tierDef), reg };
};

const serializeProfile = (user: any, attendee: any, tier: string) => ({
    _id: user._id,
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    role: attendee?.role ?? '',
    company: attendee?.company ?? '',
    industry: attendee?.industry ?? '',
    interests: attendee?.interests ?? [],
    networkingGoals: attendee?.networkingGoals ?? '',
    initials: getInitials(user.name),
    color: getColorForId(user._id?.toString?.()),
    avatarUrl: user.avatarUrl,
    tier,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /profile */
export const getProfile = async (userId: string, params: { eventId?: string }) => {
    const user = await User.findById(userId).populate('attendeeProfile').lean();
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const { tier, reg } = await resolveCurrentTier(userId, params.eventId);
    const profile = serializeProfile(user, user.attendeeProfile, tier);

    const [currentEventDoc, regs] = await Promise.all([
        reg
            ? Event.findById(reg.eventId).select('name slug startDate organiserId').lean()
            : null,
        Registration.find({ userId, status: 'confirmed' })
            .populate('eventId', 'name slug startDate organiserId')
            .lean(),
    ]);

    return {
        ...profile,
        currentEvent: currentEventDoc ?? undefined,
        enrolledEvents: regs.map((r) => r.eventId).filter(Boolean),
    };
};

/** GET /profile/:userId */
export const getPublicProfile = async (targetUserId: string, params: { eventId?: string }) => {
    const user = await User.findById(targetUserId).populate('attendeeProfile').lean();
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const { tier } = await resolveCurrentTier(targetUserId, params.eventId);
    return serializeProfile(user, user.attendeeProfile, tier);
};

export interface ProfileUpdateInput {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    role?: string;
    company?: string;
    industry?: string;
    interests?: string[];
    networkingGoals?: string;
    avatarUrl?: string;
}

/** PATCH /profile — splits fields across User + Attendee documents transparently. */
export const updateProfile = async (userId: string, input: ProfileUpdateInput) => {
    const userFields: Record<string, any> = {};
    const attendeeFields: Record<string, any> = {};

    if (input.name !== undefined) userFields.name = input.name;
    if (input.email !== undefined) userFields.email = input.email.toLowerCase();
    if (input.phone !== undefined) userFields.phone = input.phone;
    if (input.bio !== undefined) userFields.bio = input.bio;
    if (input.avatarUrl !== undefined) userFields.avatarUrl = input.avatarUrl;

    if (input.role !== undefined) attendeeFields.role = input.role;
    if (input.company !== undefined) attendeeFields.company = input.company;
    if (input.industry !== undefined) attendeeFields.industry = input.industry;
    if (input.interests !== undefined) attendeeFields.interests = input.interests;
    if (input.networkingGoals !== undefined) attendeeFields.networkingGoals = input.networkingGoals;

    const user = await User.findByIdAndUpdate(userId, { $set: userFields }, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    let attendee = null;
    if (Object.keys(attendeeFields).length > 0) {
        attendee = await Attendee.findOneAndUpdate(
            { userId },
            { $set: attendeeFields },
            { new: true, runValidators: true, upsert: false },
        );
    } else if (user.attendeeProfile) {
        attendee = await Attendee.findById(user.attendeeProfile);
    }

    const { tier } = await resolveCurrentTier(userId);
    return serializeProfile(user.toObject(), attendee, tier);
};

/**
 * POST /profile/avatar — stores the uploaded file and returns its URL.
 * Uses local disk storage under /uploads (served statically — wire this up
 * in server.ts, see GAP_ANALYSIS.md → "Profile module"). Swap for S3/
 * Cloudinary in production; the controller only depends on this returning
 * a public URL string.
 */
export const setAvatarUrl = async (userId: string, avatarUrl: string) => {
    const user = await User.findByIdAndUpdate(userId, { $set: { avatarUrl } }, { new: true });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return avatarUrl;
};

/** GET /profile/business-card */
export const getBusinessCard = async (
    requesterUserId: string,
    params: { userId?: string; eventId?: string },
) => {
    const targetUserId = params.userId ?? requesterUserId;

    const user = await User.findById(targetUserId).populate('attendeeProfile').lean();
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const { tier } = await resolveCurrentTier(targetUserId, params.eventId);
    const attendee: any = user.attendeeProfile ?? {};

    const baseUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    const shareUrl = `${baseUrl}/profile/${targetUserId}${params.eventId ? `?eventId=${params.eventId}` : ''}`;

    return {
        userId: user._id,
        name: user.name,
        role: attendee.role ?? '',
        company: attendee.company ?? '',
        interests: attendee.interests ?? [],
        tier,
        avatarUrl: user.avatarUrl,
        qrCodeData: shareUrl,
        shareUrl,
    };
};

/** GET /profile/events */
export const getUserEvents = async (userId: string) => {
    const regs = await Registration.find({ userId })
        .populate('eventId', 'name slug startDate endDate location bannerUrl organiserId status attendeesCount')
        .lean();

    const now = new Date();
    const enrolled = regs
        .filter((r) => r.status === 'confirmed' && r.eventId && new Date((r.eventId as any).startDate) >= now)
        .map((r) => r.eventId);
    const attended = regs
        .filter((r) => r.status === 'confirmed' && r.eventId && new Date((r.eventId as any).startDate) < now)
        .map((r) => r.eventId);

    return { enrolled, attended, organised: [] as any[] };
};
