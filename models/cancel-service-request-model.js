"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    close_reason: { type: mongoose_1.Schema.Types.ObjectId },
    close_note: { type: String },
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const CancelServiceRequestModel = (0, mongoose_1.model)('cancel_service_request', schema);
exports.default = CancelServiceRequestModel;
