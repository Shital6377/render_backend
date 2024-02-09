"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    unique_id: { type: String },
    company_name: { type: String },
    service_type_id: { type: mongoose_1.Schema.Types.ObjectId },
    first_name: { type: String },
    stripe_user_id: { type: String },
    stripe_payload: { type: String },
    type: { type: String },
    last_name: { type: String },
    user_name: { type: String },
    date_of_birth: { type: String },
    location: { type: String },
    mobile_no: { type: String },
    email: { type: String },
    is_verified: { type: Boolean, default: false },
    password: { type: String },
    profile_photo: { type: String },
    upload_brochure: { type: String },
    is_active: { type: Boolean, default: true },
    email_is_active: { type: Boolean, default: true },
    firebase_is_active: { type: Boolean, default: true },
    current_commission: { type: String, default: "0" },
    commission_sing: { type: String },
    wallet_amount: { type: String, default: "0" },
    updated_by: { type: String }
}, {
    timestamps: true,
});
const UserModel = (0, mongoose_1.model)("users", schema);
exports.default = UserModel;
