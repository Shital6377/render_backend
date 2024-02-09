"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    email: { type: String },
    password: { type: String, required: false },
    first_name: { type: String },
    last_name: { type: String },
    profile_photo: { type: Object },
    is_admin: { type: String },
    role_id: { type: mongoose_1.Schema.Types.Mixed, required: true },
    is_active: { type: String, default: 'false' },
    mobile_no: { type: String },
    updated_by: { type: String }
}, {
    timestamps: true
});
const AdminsModel = (0, mongoose_1.model)('admins', schema);
exports.default = AdminsModel;
