"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    stripe_card_id: { type: String },
    stripe_payload: { type: String },
    card_no: { type: String },
    source: { type: String },
    brand: { type: String },
    exp_month: { type: String },
    exp_year: { type: String },
    funding: { type: String },
    last4: { type: String },
    security_code: { type: String },
    number: { type: String },
    is_default: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const CardModel = (0, mongoose_1.model)("cards", schema);
exports.default = CardModel;
