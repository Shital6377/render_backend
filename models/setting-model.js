"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    setting_name: { type: String },
    setting_value: { type: String },
}, {
    timestamps: true
});
const SettingModel = (0, mongoose_1.model)('settings', schema);
exports.default = SettingModel;
