import mongoose, { Schema, Document, Model } from 'mongoose';
import { comparePassword } from '../utils/hash';

//  Interface 

export interface IOrganiser {
    name: string;
    email: string;
    passwordHash: string;
    organisationName: string;
    organisationDescription?: string;
    logoUrl?: string;
    website?: string;
    phone?: string;
    isVerified: boolean;
    accountType: 'organiser';
    createdAt: Date;
    updatedAt: Date;
}

//  Document 

export interface IOrganiserDocument extends IOrganiser, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IOrganiser, 'passwordHash'>;
}

//  Model 

export interface IOrganiserModel extends Model<IOrganiserDocument> {
    findByEmail(email: string): Promise<IOrganiserDocument | null>;
}

//  Schema 

const OrganiserSchema = new Schema<IOrganiserDocument, IOrganiserModel>(
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
            select: false,
        },
        organisationName: {
            type: String,
            required: [true, 'Organisation name is required'],
            trim: true,
            maxlength: [150, 'Organisation name cannot exceed 150 characters'],
        },
        organisationDescription: {
            type: String,
            maxlength: [600, 'Description cannot exceed 600 characters'],
        },
        logoUrl: { type: String },
        website: { type: String, trim: true },
        phone: { type: String, trim: true },
        isVerified: { type: Boolean, default: false },
        accountType: { type: String, enum: ['organiser'], default: 'organiser' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

//  Indexes 

OrganiserSchema.index({ email: 1 });

//  Instance Methods 

OrganiserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
    return comparePassword(plain, this.passwordHash);
};

OrganiserSchema.methods.getPublicProfile = function (): Omit<IOrganiser, 'passwordHash'> {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

//  Static Methods 

OrganiserSchema.statics.findByEmail = function (email: string): Promise<IOrganiserDocument | null> {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

//  Model 

const Organiser = mongoose.model<IOrganiserDocument, IOrganiserModel>('Organiser', OrganiserSchema);

export default Organiser;
