"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const store = async (req, res, next) => {
    const validationRule = {
        "bid_id": 'required|string',
        "card_id": 'required|string'
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
};
