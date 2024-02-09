"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    sensordata: { type: mongoose_1.Schema.Types.Mixed },
    devicetoken: { type: String },
    address: { type: String },
    updated_by: { type: String },
    day: { type: Number }
}, {
    timestamps: true,
});
const SensorModel = (0, mongoose_1.model)("sensors", schema);
exports.default = SensorModel;
