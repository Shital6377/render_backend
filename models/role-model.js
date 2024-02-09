"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    permission_name: { type: String },
    guard_name: { type: String },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const RoleModel = (0, mongoose_1.model)('roles', schema);
exports.default = RoleModel;
