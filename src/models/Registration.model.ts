import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { REGISTRATION_STATUSES, RegistrationStatus } from '../utils/constants';

//  Interface 

export interface IRegistration {
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    tierId: string;                                       // references event.tiers.tierId
    tierLabel: string;                                    // snapshot at registration time
    tierPrice: number;                                    // snapshot at registration time
    status: RegistrationStatus;
    customFieldValues: Record<string, string | boolean | number>;
    registeredAt: Date;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

//  Document 

export interface IRegistrationDocument extends IRegistration, Document {
    confirm(): Promise<IRegistrationDocument>;
    cancel(): Promise<IRegistrationDocument>;
}

//  Model 

export interface IRegistrationModel extends Model<IRegistrationDocument> {}

//  Schema 

const RegistrationSchema = new Schema<IRegistrationDocument, IRegistrationModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
        },
        tierId: {
            type: String,
            required: [true, 'Tier ID is required'],
        },
        tierLabel: {
            type: String,
            required: [true, 'Tier label is required'],
        },
        tierPrice: {
            type: Number,
            required: [true, 'Tier price is required'],
            min: 0,
        },
        status: {
            type: String,
            enum: REGISTRATION_STATUSES,
            default: 'pending',
        },
        customFieldValues: {
            type: Schema.Types.Mixed,
            default: {},
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
        confirmedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

//  Indexes 

// One registration per user per event — enforced at DB level
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, tierId: 1 });
RegistrationSchema.index({ eventId: 1, status: 1 });
RegistrationSchema.index({ userId: 1, status: 1 });

//  Instance Methods 

RegistrationSchema.methods.confirm = async function (): Promise<IRegistrationDocument> {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return this.save();
};

RegistrationSchema.methods.cancel = async function (): Promise<IRegistrationDocument> {
    this.status = 'cancelled';
    return this.save();
};

//  Model 

const Registration = mongoose.model<IRegistrationDocument, IRegistrationModel>(
    'Registration',
    RegistrationSchema,
);

export default Registration;
