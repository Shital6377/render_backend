"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    admin_id: { type: mongoose_1.Schema.Types.Mixed },
    vendor_id: { type: mongoose_1.Schema.Types.Mixed },
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    type: { type: String },
    room_id: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const ChatModel = (0, mongoose_1.model)('chats', schema);
exports.default = ChatModel;
