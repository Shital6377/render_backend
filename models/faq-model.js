"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    question: { type: String },
    answer: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const FaqModel = (0, mongoose_1.model)('faqs', schema);
exports.default = FaqModel;
