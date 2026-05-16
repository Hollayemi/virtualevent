import { Document, Model, Types } from 'mongoose';
import { RegistrationStatus } from '../utils/constants';
export interface IRegistration {
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    tierId: string;
    tierLabel: string;
    tierPrice: number;
    status: RegistrationStatus;
    customFieldValues: Record<string, string | boolean | number>;
    registeredAt: Date;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRegistrationDocument extends IRegistration, Document {
    confirm(): Promise<IRegistrationDocument>;
    cancel(): Promise<IRegistrationDocument>;
}
export interface IRegistrationModel extends Model<IRegistrationDocument> {
}
declare const Registration: IRegistrationModel;
export default Registration;
//# sourceMappingURL=Registration.model.d.ts.map