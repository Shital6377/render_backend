"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//  My Assets DroupDown
const schema = new mongoose_1.Schema({
    name: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});
const AssetCategoriesModel = (0, mongoose_1.model)('asset_categories', schema);
exports.default = AssetCategoriesModel;
