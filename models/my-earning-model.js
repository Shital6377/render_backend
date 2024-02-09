"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    bid_id: { type: mongoose_1.Schema.Types.ObjectId },
    card_id: { type: mongoose_1.Schema.Types.ObjectId },
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    old_wallet_amount: { type: String },
    new_wallet_amount: { type: String },
    sp_received_amount: { type: String },
    admin_received_amount: { type: String },
    amount: { type: String },
    status: { type: String },
    admin_percentage: { type: String },
    vendor_percentage: { type: String },
    transfer_reference_id: { type: String },
}, {
    timestamps: true,
});
const MyEarningModel = (0, mongoose_1.model)("my_earnings", schema);
exports.default = MyEarningModel;
