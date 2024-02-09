"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    service_request_id: { type: mongoose_1.Schema.Types.Mixed },
    path: { type: String },
    type: { type: String }, // 1 for images  2 for documnet 
}, {
    timestamps: true
});
const serviceRequestImageModel = (0, mongoose_1.model)('service_request_files', schema);
exports.default = serviceRequestImageModel;
