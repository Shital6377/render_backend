"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    // email: { type: String },
    location: { type: String },
    // name: { type: String },
    // mobile_no: { type: String },
    subject: { type: String },
    message: { type: String },
    images: { type: String },
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const ContactUsModel = (0, mongoose_1.model)('suggestions', schema);
exports.default = ContactUsModel;
