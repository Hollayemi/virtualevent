import { Document, Model } from 'mongoose';
export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    bio?: string;
    role?: string;
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
export interface IUserDocument extends IUser, Document {
    comparePassword(plain: string): Promise<boolean>;
    getPublicProfile(): Omit<IUser, 'passwordHash'>;
}
export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
}
declare const User: IUserModel;
export default User;
//# sourceMappingURL=User.model.d.ts.map