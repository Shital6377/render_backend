"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    parent_id: { type: mongoose_1.Schema.Types.Mixed },
    name: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const CategoriesModel = (0, mongoose_1.model)('categories', schema);
exports.default = CategoriesModel;
