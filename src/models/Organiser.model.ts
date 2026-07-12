import mongoose, { Schema, Document, Model } from 'mongoose';
import { comparePassword } from '../utils/hash';

export interface IOrganiser {
   userId: string;
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
        userId: { type: String, ref: "User", required: true, unique: true },
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
