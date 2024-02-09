"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const store = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "setting_name": "required|string|exist:settings,setting_name," + id,
        "setting_value": "required|string",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
};
