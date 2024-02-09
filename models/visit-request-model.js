"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    interest: { type: String },
    your_message: { type: String },
    justification: { type: String },
    response_date: { type: Date },
    is_active: { type: Boolean, default: true },
    title: { type: String },
    platform_statement: { type: String },
}, {
    timestamps: true,
});
const visitReqModel = (0, mongoose_1.model)("visit_requests", schema);
exports.default = visitReqModel;
