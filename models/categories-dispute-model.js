"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const CategoriesDisputeModel = (0, mongoose_1.model)('categories_dispute', schema);
exports.default = CategoriesDisputeModel;
