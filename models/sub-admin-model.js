"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    email: { type: String },
    password: { type: String, required: false },
    first_name: { type: String },
    last_name: { type: String },
    profile_photo: { type: String },
    role_id: { type: mongoose_1.Schema.Types.Mixed },
    is_active: { type: Boolean, default: false },
    mobile_no: { type: String, required: true }
}, {
    timestamps: true
});
const AdminsModel = (0, mongoose_1.model)('sub_admins', schema);
exports.default = AdminsModel;
