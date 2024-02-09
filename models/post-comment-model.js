"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    post_id: { type: mongoose_1.Schema.Types.Mixed },
    vendor_id: { type: mongoose_1.Schema.Types.Mixed },
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    admin_id: { type: mongoose_1.Schema.Types.Mixed },
    type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
    comment: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const PostCommentModel = (0, mongoose_1.model)('post_comments', schema);
exports.default = PostCommentModel;
