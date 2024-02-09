"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    vendor_id: { type: mongoose_1.Schema.Types.Mixed },
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    message_field: { type: String },
    typical_text: { type: String },
    amount: { type: String },
    currency: { type: String },
    delivery_timeframe: { type: String },
    validity: { type: String },
    other_conditions: { type: String },
    bidder_note: { type: String },
    bidder_signature: { type: String },
    signature_time: { type: Date },
    // is_active: { type: Boolean, default: true },
    // is_selected: { type: String, default: '0' }, //0 id pending 1 is accept 2 is rejectd
    // status: { type: String },
    status: { type: String },
    reject_reason_id: { type: mongoose_1.Schema.Types.ObjectId },
    reject_note: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true,
});
const BidModel = (0, mongoose_1.model)("bids", schema);
exports.default = BidModel;
