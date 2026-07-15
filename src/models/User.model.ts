import mongoose, { Schema, Document, Model } from 'mongoose';
import { comparePassword } from '../utils/hash';
import { Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface INotificationPreferences {
    connectionRequests: boolean;
    messages: boolean;
    meetingReminders: boolean;
    marketingEmails: boolean;
    eventUpdates: boolean;
    systemAlerts: boolean;
}

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    isVerified: boolean;
    attendeeProfile: Types.ObjectId;  // Reference to Attendee profile
    organiserProfile: Types.ObjectId; // Reference to Organiser profile
    vipProtectionEnabled: boolean;   // M2: when true, lower-tier users must spend credits to connect
    accountType: 'attendee' | 'organiser';
    // settings.slice.ts — dual-role support ("switch on the other role later").
    // `accountType` is kept for backward compatibility with existing JWT/authZ
    // checks (requireAccountType) and now tracks the same value as `activeRole`.
    roles: { attendee: boolean; organizer: boolean };
    activeRole: 'attendee' | 'organizer';
    notifications: INotificationPreferences;
    preferredLanguage: string;
    timezone: string;
    deletionScheduledFor?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Document (instance methods) ──────────────────────────────────────────────

export interface IUserDocument extends IUser, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IUser, 'passwordHash'>;
}

// ─── Model (static methods) ───────────────────────────────────────────────────

export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUserDocument, IUserModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        attendeeProfile: {
            type: Schema.Types.ObjectId,
            ref: "Attendee"
        },
        organiserProfile: {
            type: Schema.Types.ObjectId,
            ref: "Organiser"
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            select: false,        // never returned by default
        },
        phone: { type: String, trim: true },
        bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
        avatarUrl: { type: String },
        accountType: { type: String, enum: ['attendee', 'organiser'], default: 'attendee' },
        roles: {
            attendee: { type: Boolean, default: true },
            organizer: { type: Boolean, default: false },
        },
        activeRole: {
            type: String,
            enum: ['attendee', 'organizer'],
            default: 'attendee',
        },
        notifications: {
            connectionRequests: { type: Boolean, default: true },
            messages: { type: Boolean, default: true },
            meetingReminders: { type: Boolean, default: true },
            marketingEmails: { type: Boolean, default: false },
            eventUpdates: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true },
        },
        preferredLanguage: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' },
        deletionScheduledFor: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);


UserSchema.index({ email: 1 });
UserSchema.index({ industry: 1 });
UserSchema.index({ company: 1 });

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
    return comparePassword(plain, this.passwordHash);
};

UserSchema.methods.getPublicProfile = function (): Omit<IUser, 'passwordHash'> {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};


UserSchema.statics.findByEmail = function (email: string): Promise<IUserDocument | null> {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};


const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
