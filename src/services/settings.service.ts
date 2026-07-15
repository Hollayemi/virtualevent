import User from '../models/User.model';
import Organiser from '../models/Organiser.model';
import { AppError } from '../middleware/error';
import { hashPassword, comparePassword } from '../utils/hash';

const serializeSettings = (user: any) => ({
    _id: user._id,
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    notifications: user.notifications,
    roles: user.roles,
    activeRole: user.activeRole,
    preferredLanguage: user.preferredLanguage,
    timezone: user.timezone,
});

/** GET /settings */
export const getSettings = async (userId: string) => {
    const user = await User.findById(userId).lean();
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return serializeSettings(user);
};

export interface UpdateAccountInput {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
}

/** PATCH /settings/account */
export const updateAccount = async (userId: string, input: UpdateAccountInput) => {
    const changingSensitiveField = Boolean(input.email || input.newPassword);

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    if (changingSensitiveField) {
        if (!input.currentPassword) {
            throw new AppError('Current password is required to change your email or password', 400);
        }
        const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', 401, 'UNAUTHORIZED');
        }
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.email !== undefined) user.email = input.email.toLowerCase();
    if (input.newPassword) user.passwordHash = await hashPassword(input.newPassword);

    await user.save();

    return { name: user.name, email: user.email, phone: user.phone };
};

export interface UpdateNotificationsInput {
    connectionRequests?: boolean;
    messages?: boolean;
    meetingReminders?: boolean;
    marketingEmails?: boolean;
    eventUpdates?: boolean;
    systemAlerts?: boolean;
}

/** PATCH /settings/notifications */
export const updateNotifications = async (userId: string, input: UpdateNotificationsInput) => {
    const setFields: Record<string, any> = {};
    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) setFields[`notifications.${key}`] = value;
    });

    const user = await User.findByIdAndUpdate(userId, { $set: setFields }, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    return user.notifications;
};

export interface EnableOrganizerInput {
    organisationName: string;
    eventName?: string;
}

/**
 * POST /settings/roles/organizer — "switch on the other role later".
 * Creates an Organiser profile for this user (if one doesn't already exist),
 * links it, flips roles.organizer on, and makes it the active role.
 * `eventName` is accepted for parity with the frontend contract but no event
 * is created here — event creation already has its own flow
 * (POST /events, organiser-only). Wire that up in the frontend's onboarding
 * step if a starter event should be created automatically.
 */
export const enableOrganizerRole = async (userId: string, input: EnableOrganizerInput) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    let organiserId = user.organiserProfile;

    if (!organiserId) {
        const organiser = await Organiser.create({
            userId: user._id,
            organisationName: input.organisationName,
        });
        organiserId = organiser._id;
        user.organiserProfile = organiserId;
    }

    user.roles.organizer = true;
    user.activeRole = 'organizer';
    await user.save();

    return {
        userId: user._id.toString(),
        roles: user.roles,
        activeRole: 'organizer' as const,
        organizationId: organiserId?.toString(),
    };
};

/** PATCH /settings/roles/active */
export const switchActiveRole = async (userId: string, role: 'attendee' | 'organizer') => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    if (!user.roles[role]) {
        throw new AppError(
            `You haven't enabled the ${role} role yet`,
            400,
        );
    }

    user.activeRole = role;
    await user.save();

    return { activeRole: user.activeRole };
};

const GRACE_PERIOD_DAYS = 30;

/** DELETE /settings/account */
export const deleteAccount = async (
    userId: string,
    input: { confirm: string; currentPassword?: string },
) => {
    if (input.confirm !== 'DELETE') {
        throw new AppError('Type DELETE to confirm account deletion', 400);
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    if (input.currentPassword) {
        const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
        if (!isMatch) throw new AppError('Current password is incorrect', 401, 'UNAUTHORIZED');
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS);

    user.deletionScheduledFor = scheduledFor;
    await user.save();

    return { userId: user._id.toString(), deleted: true, scheduledFor: scheduledFor.toISOString() };
};
