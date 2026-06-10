import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { CONNECTION_STATUSES, ConnectionStatus, INTENTION_TAGS, IntentionTag } from '../utils/constants';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IConnection {
    eventId: Types.ObjectId;
    requesterId: Types.ObjectId;
    recipientId: Types.ObjectId;
    requesterTierId: string;
    recipientTierId: string;
    status: ConnectionStatus;
    intentionTag: IntentionTag;
    message?: string;
    creditCost: number;        // M2: credits spent to send this request (0 if non-VIP)
    wasVipGated: boolean;      // M2: true if recipient had VIP protection at request time
    createdAt: Date;
    updatedAt: Date;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface IConnectionDocument extends IConnection, Document {
    accept(): Promise<IConnectionDocument>;
    decline(): Promise<IConnectionDocument>;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface IConnectionModel extends Model<IConnectionDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const ConnectionSchema = new Schema<IConnectionDocument, IConnectionModel>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
        },
        requesterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Requester ID is required'],
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient ID is required'],
        },
        requesterTierId: {
            type: String,
            required: [true, 'Requester tier ID is required'],
        },
        recipientTierId: {
            type: String,
            required: [true, 'Recipient tier ID is required'],
        },
        status: {
            type: String,
            enum: CONNECTION_STATUSES,
            default: 'pending',
        },
        intentionTag: {
            type: String,
            enum: INTENTION_TAGS,
            required: [true, 'Intention tag is required'],
        },
        message: {
            type: String,
            maxlength: [300, 'Message cannot exceed 300 characters'],
        },
        creditCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        wasVipGated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// No duplicate requests between same two users in the same event
ConnectionSchema.index(
    { eventId: 1, requesterId: 1, recipientId: 1 },
    { unique: true },
);
ConnectionSchema.index({ eventId: 1, requesterId: 1 });
ConnectionSchema.index({ eventId: 1, recipientId: 1 });
ConnectionSchema.index({ eventId: 1, status: 1 });

// ─── Pre-save: cannot connect to yourself ─────────────────────────────────────

ConnectionSchema.pre('save', function (next) {
    if (this.requesterId.toString() === this.recipientId.toString()) {
        return next(new Error('You cannot send a connection request to yourself'));
    }
    next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

ConnectionSchema.methods.accept = async function (): Promise<IConnectionDocument> {
    this.status = 'accepted';
    return this.save();
};

ConnectionSchema.methods.decline = async function (): Promise<IConnectionDocument> {
    this.status = 'declined';
    return this.save();
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Connection = mongoose.model<IConnectionDocument, IConnectionModel>(
    'Connection',
    ConnectionSchema,
);

export default Connection;
