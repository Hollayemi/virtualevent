import { Document, Model, Types } from 'mongoose';
import { EventStatus, CustomFieldType, LocationType } from '../utils/constants';
export interface ITier {
    tierId: string;
    label: string;
    description?: string;
    price: number;
    capacity: number;
    isVIP: boolean;
    color?: string;
}
export interface ICustomField {
    fieldKey: string;
    label: string;
    type: CustomFieldType;
    options?: string[];
    isRequired: boolean;
    placeholder?: string;
}
export interface IEventLocation {
    type: LocationType;
    address?: string;
    city?: string;
    virtualLink?: string;
}
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
export interface IEventDocument extends IEvent, Document {
    getTierByPrice(price: number): ITier | undefined;
    getTierById(tierId: string): ITier | undefined;
    isAtCapacity(tierId: string, currentCount: number): boolean;
    getHighestTier(): ITier | undefined;
    getRequiredCustomFields(): ICustomField[];
}
export interface IEventModel extends Model<IEventDocument> {
}
declare const Event: IEventModel;
export default Event;
//# sourceMappingURL=Event.model.d.ts.map