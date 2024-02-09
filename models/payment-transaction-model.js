"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    bid_id: { type: mongoose_1.Schema.Types.ObjectId },
    card_id: { type: mongoose_1.Schema.Types.ObjectId },
    amount: { type: String },
    received_amount: { type: String },
    commission_charge: { type: String },
    status: { type: String },
    discount: { type: String },
    stripe_payload: { type: String },
    stripe_request_id: { type: String },
    transfer_reference_id: { type: String },
    admin_percentage: { type: String },
    vendor_percentage: { type: String },
}, {
    timestamps: true,
});
const PaymentTransactionModel = (0, mongoose_1.model)("payment_transactions", schema);
exports.default = PaymentTransactionModel;
