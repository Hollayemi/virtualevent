import { IntentionTag } from '../utils/constants';
import mongoose from 'mongoose';
interface SendConnectionInput {
    requesterId: string;
    recipientId: string;
    eventId: string;
    intentionTag: IntentionTag;
    message?: string;
}
export declare const sendConnectionRequest: (input: SendConnectionInput) => Promise<Omit<mongoose.Document<unknown, {}, import("../models/Connection.model").IConnectionDocument, {}, {}> & import("../models/Connection.model").IConnectionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, never>>;
export declare const respondToConnection: (userId: string, connectionId: string, action: "accept" | "decline") => Promise<Omit<mongoose.Document<unknown, {}, import("../models/Connection.model").IConnectionDocument, {}, {}> & import("../models/Connection.model").IConnectionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, never>>;
export declare const getEventConnections: (userId: string, eventId: string) => Promise<(mongoose.FlattenMaps<import("../models/Connection.model").IConnectionDocument> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const browseAttendeesInTier: (userId: string, eventId: string) => Promise<any[]>;
export {};
//# sourceMappingURL=connection.service.d.ts.map