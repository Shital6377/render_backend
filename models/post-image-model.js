"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    post_id: { type: mongoose_1.Schema.Types.Mixed },
    image: { type: String },
}, {
    timestamps: true
});
const postImageModel = (0, mongoose_1.model)('post_images', schema);
exports.default = postImageModel;
