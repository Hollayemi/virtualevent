import { Document, Model } from 'mongoose';
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
export interface IOrganiserDocument extends IOrganiser, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IOrganiser, 'passwordHash'>;
}
export interface IOrganiserModel extends Model<IOrganiserDocument> {
    findByEmail(email: string): Promise<IOrganiserDocument | null>;
}
declare const Organiser: IOrganiserModel;
export default Organiser;
//# sourceMappingURL=Organiser.model.d.ts.map