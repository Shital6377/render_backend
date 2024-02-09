"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("./validate_"));
const idRequiredQuery = async (req, res, next) => {
    const ValidationRule = {
        "id": "required|string",
    };
    validate_1.default.validatorUtilWithCallbackQuery(ValidationRule, {}, req, res, next);
};
const idRequired = async (req, res, next) => {
    const ValidationRule = {
        "id": "required|string",
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
const _UserIdRequired = async (req, res, next) => {
    const ValidationRule = {
        "user": {
            _id: "required|string"
        },
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
const idRequiredParams = (req, res, next) => {
    const ValidationRule = {
        "id": "required|string",
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
const storeChat = async (req, res, next) => {
    const ValidationRule = {
        "type": "required",
        "admin_id": [{ "required_if": ['type', 1] }],
        "vendor_id": [{ "required_if": ['type', 2] }],
        "user_id": [{ "required_if": ['type', 3] }],
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
const fieldExistValidation = (req, res, next) => {
    const ValidationRule = {
        "filed_value": "required|string",
        "field": "required|string",
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
exports.default = {
    storeChat,
    idRequired,
    idRequiredQuery,
    _UserIdRequired,
    idRequiredParams,
    fieldExistValidation
};
