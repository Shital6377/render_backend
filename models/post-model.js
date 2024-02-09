"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    vendor_id: { type: mongoose_1.Schema.Types.Mixed },
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    admin_id: { type: mongoose_1.Schema.Types.Mixed },
    type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
    // title: { type: String },
    // slug: { type: String },
    // short_description: { type: String },
    // service_provider_name: { type: String },
    // date_time: { type: String },
    description: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const PostModel = (0, mongoose_1.model)('posts', schema);
exports.default = PostModel;
