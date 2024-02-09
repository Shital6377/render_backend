"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    type: { type: String },
    url: { type: String, required: false },
    video: { type: String },
    doc: { type: String },
    title: { type: String },
    description: { type: String },
    image: { type: String },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const TrainingMaterialModel = (0, mongoose_1.model)('training_materials', schema);
exports.default = TrainingMaterialModel;
