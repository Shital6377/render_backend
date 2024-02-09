"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId },
    admin_id: { type: mongoose_1.Schema.Types.ObjectId },
    current_commission: { type: String, default: "0" },
    old_commission: { type: String, default: "0" },
    commission_sing: { type: String, default: "$" },
}, {
    timestamps: true,
});
const CommissionHistoryModal = (0, mongoose_1.model)("commisstion_history", schema);
exports.default = CommissionHistoryModal;
