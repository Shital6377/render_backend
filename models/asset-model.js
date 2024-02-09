"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// SR Walu 
const schema = new mongoose_1.Schema({
    service_type_id: { type: mongoose_1.Schema.Types.Mixed },
    name: { type: String },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true,
});
const AssetModel = (0, mongoose_1.model)("assets", schema);
exports.default = AssetModel;
