import { Document, Model, Types } from 'mongoose';
import { ConnectionStatus, IntentionTag } from '../utils/constants';
export interface IConnection {
    eventId: Types.ObjectId;
    requesterId: Types.ObjectId;
    recipientId: Types.ObjectId;
    requesterTierId: string;
    recipientTierId: string;
    status: ConnectionStatus;
    intentionTag: IntentionTag;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IConnectionDocument extends IConnection, Document {
    accept(): Promise<IConnectionDocument>;
    decline(): Promise<IConnectionDocument>;
}
export interface IConnectionModel extends Model<IConnectionDocument> {
}
declare const Connection: IConnectionModel;
export default Connection;
//# sourceMappingURL=Connection.model.d.ts.map