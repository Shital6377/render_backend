"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const PriorityModel = (0, mongoose_1.model)('priorities', schema);
exports.default = PriorityModel;
