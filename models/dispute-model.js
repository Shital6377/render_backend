"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    service_request_id: { types: mongoose_1.Schema.Types.ObjectId },
    bid_id: { type: mongoose_1.Schema.Types.ObjectId },
    category: { type: mongoose_1.Schema.Types.ObjectId },
    root_cause: { type: String },
    damages: { type: String },
    action: { type: String },
    add_response: { type: String },
    document: { type: String },
    photo: { type: String },
    status: { type: String },
    update: { type: String },
}, { timestamps: true, toJSON: { virtuals: true } });
const DisputeModel = (0, mongoose_1.model)("disputes", schema);
exports.default = DisputeModel;
