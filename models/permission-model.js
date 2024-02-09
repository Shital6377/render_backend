"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    module: { type: String },
    position: { type: String },
    parent: { type: String },
    guard_name: { type: String },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const PermissionsModel = (0, mongoose_1.model)('permissions', schema);
exports.default = PermissionsModel;
