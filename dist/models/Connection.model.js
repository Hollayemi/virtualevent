"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../utils/constants");
//  Schema 
const ConnectionSchema = new mongoose_1.Schema({
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required'],
    },
    requesterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requester ID is required'],
    },
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: constants_1.CONNECTION_STATUSES,
        default: 'pending',
    },
    intentionTag: {
        type: String,
        enum: constants_1.INTENTION_TAGS,
        required: [true, 'Intention tag is required'],
    },
    message: {
        type: String,
        maxlength: [300, 'Message cannot exceed 300 characters'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
//  Indexes 
// No duplicate requests between same two users in the same event
ConnectionSchema.index({ eventId: 1, requesterId: 1, recipientId: 1 }, { unique: true });
ConnectionSchema.index({ eventId: 1, requesterId: 1 });
ConnectionSchema.index({ eventId: 1, recipientId: 1 });
ConnectionSchema.index({ eventId: 1, status: 1 });
//  Pre-save: cannot connect to yourself 
ConnectionSchema.pre('save', function (next) {
    if (this.requesterId.toString() === this.recipientId.toString()) {
        return next(new Error('You cannot send a connection request to yourself'));
    }
    next();
});
//  Instance Methods 
ConnectionSchema.methods.accept = async function () {
    this.status = 'accepted';
    return this.save();
};
ConnectionSchema.methods.decline = async function () {
    this.status = 'declined';
    return this.save();
};
//  Model 
const Connection = mongoose_1.default.model('Connection', ConnectionSchema);
exports.default = Connection;
//# sourceMappingURL=Connection.model.js.map