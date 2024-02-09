"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    admin_id: { type: mongoose_1.Schema.Types.Mixed },
    type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
    title: { type: String },
    message: { type: String },
    is_read: { type: Boolean, default: false },
    payload: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const NotificationModel = (0, mongoose_1.model)('notifications', schema);
exports.default = NotificationModel;
