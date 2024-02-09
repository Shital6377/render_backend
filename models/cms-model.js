"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    key: { type: String },
    value: { type: String },
}, {
    timestamps: true
});
const CmsModel = (0, mongoose_1.model)('cms', schema);
exports.default = CmsModel;
