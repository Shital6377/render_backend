"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId },
    bid_id: { type: mongoose_1.Schema.Types.ObjectId },
    service_request_id: { type: mongoose_1.Schema.Types.ObjectId },
    service_status: { type: String },
    rating_workmanship: { type: Number },
    rating_materials: { type: Number },
    rating_timeframe: { type: Number },
    rating_behavior: { type: Number },
    rating_overall: { type: Number },
    review: { type: String },
}, {
    timestamps: true,
});
const ReviewModel = (0, mongoose_1.model)("reviews", schema);
exports.default = ReviewModel;
