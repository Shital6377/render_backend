"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    img: { type: String },
    index: { type: Number },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const OurServicesModel = (0, mongoose_1.model)('our_services', schema);
exports.default = OurServicesModel;
