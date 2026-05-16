import mongoose, { Schema, Document, Model } from 'mongoose';
import { comparePassword } from '../utils/hash';

//  Interface 

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    bio?: string;
    role?: string;           // professional role / job title
    company?: string;
    industry?: string;
    interests?: string[];
    networkingGoals?: string;
    avatarUrl?: string;
    isVerified: boolean;
    accountType: 'user';
    createdAt: Date;
    updatedAt: Date;
}

//  Document (instance methods) 

export interface IUserDocument extends IUser, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IUser, 'passwordHash'>;
}

//  Model (static methods) 

export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
}

//  Schema 

const UserSchema = new Schema<IUserDocument, IUserModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
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
        role: { type: String, trim: true },
        company: { type: String, trim: true },
        industry: { type: String, trim: true },
        interests: [{ type: String, trim: true }],
        networkingGoals: { type: String, maxlength: [300, 'Networking goals cannot exceed 300 characters'] },
        avatarUrl: { type: String },
        isVerified: { type: Boolean, default: false },
        accountType: { type: String, enum: ['user'], default: 'user' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

//  Indexes 

UserSchema.index({ email: 1 });
UserSchema.index({ industry: 1 });
UserSchema.index({ company: 1 });

//  Instance Methods 

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
    return comparePassword(plain, this.passwordHash);
};

UserSchema.methods.getPublicProfile = function (): Omit<IUser, 'passwordHash'> {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

//  Static Methods 

UserSchema.statics.findByEmail = function (email: string): Promise<IUserDocument | null> {
    // +passwordHash needed for auth comparisons
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

//  Model 

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
