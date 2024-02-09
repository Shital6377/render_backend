"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    reson: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const CancelReasonModel = (0, mongoose_1.model)('cancel_reasons', schema);
exports.default = CancelReasonModel;
