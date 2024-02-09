"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const completed = async (req, res, next) => {
    const ValidationRule = {
        "service_request_id": "required",
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
exports.default = {
    completed,
};
