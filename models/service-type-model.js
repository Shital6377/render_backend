"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    icon: { type: String },
    description: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const ServiceTypeModel = (0, mongoose_1.model)('service_type', schema);
exports.default = ServiceTypeModel;
