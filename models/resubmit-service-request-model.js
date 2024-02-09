"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    date: { type: String },
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const ResubmitServiceRequestModel = (0, mongoose_1.model)('resubmit_service_requests', schema);
exports.default = ResubmitServiceRequestModel;
