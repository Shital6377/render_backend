"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    admin_id: { type: mongoose_1.Schema.Types.Mixed, required: true },
    token: { type: String },
    firebase_token: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const AdminTokenModel = (0, mongoose_1.model)('admin_tokes', schema);
exports.default = AdminTokenModel;
