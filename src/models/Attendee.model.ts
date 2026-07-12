import mongoose, { Schema, Document, Model } from 'mongoose';
import { comparePassword } from '../utils/hash';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAttendee {
    userId: string;
    role?: string;
    company?: string;
    industry?: string;
    interests?: string[];
    networkingGoals?: string;
    avatarUrl?: string;
    isVerified: boolean;
    vipProtectionEnabled: boolean;   // M2: when true, lower-tier users must spend credits to connect
    createdAt: Date;
    updatedAt: Date;
}


export interface IAttendeeDocument extends IAttendee, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IAttendee, 'passwordHash'>;
}

export interface IAttendeeModel extends Model<IAttendeeDocument> {
    findByEmail(email: string): Promise<IAttendeeDocument | null>;
}

const AttendeeSchema = new Schema<IAttendeeDocument, IAttendeeModel>(
    {
        userId: { type: String, ref: "User", required: true, unique: true },
        role: { type: String, trim: true },
        company: { type: String, trim: true },
        industry: { type: String, trim: true },
        interests: [{ type: String, trim: true }],
        networkingGoals: { type: String, maxlength: [300, 'Networking goals cannot exceed 300 characters'] },
        avatarUrl: { type: String },
        isVerified: { type: Boolean, default: false },
        vipProtectionEnabled: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);


AttendeeSchema.index({ email: 1 });
AttendeeSchema.index({ industry: 1 });
AttendeeSchema.index({ company: 1 });

AttendeeSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
    return comparePassword(plain, this.passwordHash);
};

AttendeeSchema.methods.getPublicProfile = function (): Omit<IAttendee, 'passwordHash'> {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

AttendeeSchema.statics.findByEmail = function (email: string): Promise<IAttendeeDocument | null> {
    // +passwordHash needed for auth comparisons
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

const User = mongoose.model<IAttendeeDocument, IAttendeeModel>('Attendee', AttendeeSchema);

export default User;
