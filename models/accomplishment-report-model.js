"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    completion_date: { type: String },
    note: { type: String },
    issue: { type: String },
    customer_note: { type: String },
    document: { type: String },
    photo: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
const ComplishmentReportModel = (0, mongoose_1.model)("complishment_reports", schema);
exports.default = ComplishmentReportModel;
