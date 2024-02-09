"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String },
    value: { type: String },
    icon: { type: String }
}, {
    timestamps: true
});
const SocialMediaModel = (0, mongoose_1.model)('social_medias', schema);
exports.default = SocialMediaModel;
