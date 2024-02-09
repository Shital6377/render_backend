"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    from_user_id: { type: mongoose_1.Schema.Types.Mixed },
    to_user_id: { type: mongoose_1.Schema.Types.Mixed },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true,
});
const ReportRequestModel = (0, mongoose_1.model)("report_request", schema);
exports.default = ReportRequestModel;
