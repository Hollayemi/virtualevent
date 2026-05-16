import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
    EventStatus,
    CustomFieldType,
    LocationType,
    CUSTOM_FIELD_TYPES,
    EVENT_STATUSES,
    LOCATION_TYPES,
} from '../utils/constants';

//  Sub-document Interfaces 

export interface ITier {
    tierId: string;           // auto-generated, stable identifier
    label: string;            // organiser's chosen name (e.g. "Founders Pass")
    description?: string;
    price: number;            // KEY: determines tier rank. Free = 0
    capacity: number;         // 0 = unlimited
    isVIP: boolean;           // true if this is the highest-priced tier
    color?: string;           // optional hex for UI badge
}

export interface ICustomField {
    fieldKey: string;         // unique alphanumeric key, e.g. "linkedinUrl"
    label: string;            // display label
    type: CustomFieldType;
    options?: string[];       // only for 'select' type
    isRequired: boolean;
    placeholder?: string;
}

export interface IEventLocation {
    type: LocationType;
    address?: string;
    city?: string;
    virtualLink?: string;
}

//  Main Interface 

export interface IEvent {
    organiserId: Types.ObjectId;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: IEventLocation;
    bannerUrl?: string;
    status: EventStatus;
    tiers: ITier[];
    customFields: ICustomField[];
    totalRegistrations: number;
    createdAt: Date;
    updatedAt: Date;
}

//  Document 

export interface IEventDocument extends IEvent, Document {
    getTierByPrice(price: number): ITier | undefined;
    getTierById(tierId: string): ITier | undefined;
    isAtCapacity(tierId: string, currentCount: number): boolean;
    getHighestTier(): ITier | undefined;
    getRequiredCustomFields(): ICustomField[];
}

//  Model 

export interface IEventModel extends Model<IEventDocument> {}

//  Sub-schemas 

const TierSchema = new Schema<ITier>(
    {
        tierId: { type: String, default: () => uuidv4() },
        label: {
            type: String,
            required: [true, 'Tier label is required'],
            trim: true,
            maxlength: [60, 'Tier label cannot exceed 60 characters'],
        },
        description: { type: String, maxlength: [200, 'Tier description cannot exceed 200 characters'] },
        price: {
            type: Number,
            required: [true, 'Tier price is required'],
            min: [0, 'Price cannot be negative'],
        },
        capacity: { type: Number, default: 0, min: 0 },
        isVIP: { type: Boolean, default: false },
        color: { type: String },
    },
    { _id: false },
);

const CustomFieldSchema = new Schema<ICustomField>(
    {
        fieldKey: {
            type: String,
            required: [true, 'Field key is required'],
            match: [/^[a-zA-Z0-9_]+$/, 'Field key must be alphanumeric (underscores allowed)'],
        },
        label: { type: String, required: [true, 'Field label is required'], trim: true },
        type: {
            type: String,
            enum: CUSTOM_FIELD_TYPES,
            required: [true, 'Field type is required'],
        },
        options: [{ type: String }],
        isRequired: { type: Boolean, default: false },
        placeholder: { type: String },
    },
    { _id: false },
);

const EventLocationSchema = new Schema<IEventLocation>(
    {
        type: {
            type: String,
            enum: LOCATION_TYPES,
            required: [true, 'Location type is required'],
        },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        virtualLink: { type: String, trim: true },
    },
    { _id: false },
);

//  Main Schema 

const EventSchema = new Schema<IEventDocument, IEventModel>(
    {
        organiserId: {
            type: Schema.Types.ObjectId,
            ref: 'Organiser',
            required: [true, 'Organiser ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Event name is required'],
            trim: true,
            maxlength: [150, 'Event name cannot exceed 150 characters'],
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        location: {
            type: EventLocationSchema,
            required: [true, 'Location is required'],
        },
        bannerUrl: { type: String },
        status: {
            type: String,
            enum: EVENT_STATUSES,
            default: 'draft',
        },
        tiers: {
            type: [TierSchema],
            validate: {
                validator: (tiers: ITier[]) => tiers.length >= 1,
                message: 'At least one tier is required',
            },
        },
        customFields: { type: [CustomFieldSchema], default: [] },
        totalRegistrations: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

//  Indexes 

EventSchema.index({ organiserId: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ 'tiers.price': 1 });

//  Pre-save: Mark highest tier as VIP & validate price uniqueness 

EventSchema.pre('save', function (next) {
    const event = this as IEventDocument;

    if (!event.isModified('tiers')) return next();

    // Validate price uniqueness within tiers
    const prices = event.tiers.map((t) => t.price);
    const uniquePrices = new Set(prices);
    if (prices.length !== uniquePrices.size) {
        return next(new Error('Each tier must have a unique price'));
    }

    // Validate endDate > startDate
    if (event.endDate <= event.startDate) {
        return next(new Error('End date must be after start date'));
    }

    // Derive isVIP: tier with highest price
    const maxPrice = Math.max(...prices);
    event.tiers.forEach((tier) => {
        tier.isVIP = tier.price === maxPrice;
    });

    // Ensure each tier has a tierId
    event.tiers.forEach((tier) => {
        if (!tier.tierId) {
            tier.tierId = uuidv4();
        }
    });

    next();
});

//  Instance Methods 

EventSchema.methods.getTierByPrice = function (price: number): ITier | undefined {
    return this.tiers.find((t: ITier) => t.price === price);
};

EventSchema.methods.getTierById = function (tierId: string): ITier | undefined {
    return this.tiers.find((t: ITier) => t.tierId === tierId);
};

/**
 * Pass in the CURRENT registration count for this tier.
 * Returns true if the tier is full (capacity > 0 and count >= capacity).
 */
EventSchema.methods.isAtCapacity = function (tierId: string, currentCount: number): boolean {
    const tier = this.getTierById(tierId);
    if (!tier) return true;           // unknown tier → block
    if (tier.capacity === 0) return false;  // unlimited
    return currentCount >= tier.capacity;
};

EventSchema.methods.getHighestTier = function (): ITier | undefined {
    if (!this.tiers.length) return undefined;
    return this.tiers.reduce((max: ITier, t: ITier) => (t.price > max.price ? t : max));
};

EventSchema.methods.getRequiredCustomFields = function (): ICustomField[] {
    return this.customFields.filter((f: ICustomField) => f.isRequired);
};

//  Model 

const Event = mongoose.model<IEventDocument, IEventModel>('Event', EventSchema);

export default Event;
