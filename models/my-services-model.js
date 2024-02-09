"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    description: { type: String },
    services: [{ type: mongoose_1.Schema.Types.ObjectId }],
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    notes: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const ServiceTypeModel = (0, mongoose_1.model)('my-services', schema);
exports.default = ServiceTypeModel;
