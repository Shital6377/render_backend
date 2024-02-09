"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    field_name: { type: String },
    field_value: { type: String },
    icon: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const WhyMaintenanceModel = (0, mongoose_1.model)('why_maintenances', schema);
exports.default = WhyMaintenanceModel;
