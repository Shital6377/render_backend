"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    admin_id: { type: mongoose_1.Schema.Types.ObjectId },
    token: { type: String },
    otp: { type: String },
    expiry: { type: Date },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const OtpModel = (0, mongoose_1.model)("otp", schema);
exports.default = OtpModel;
