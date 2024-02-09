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
        "email": "required|string|email|exist:users,email," + id,
        "first_name": "required|string",
        "last_name": "required|string",
        // "user_name": "required|string|exist:users,user_name," + id,
        "mobile_no": "required|string|exist:users,mobile_no," + id,
        password: "required|string",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const changePasswordValidation = async (req, res, next) => {
    const validationRule = {
        user_id: "required",
        password: "required|string|min:6",
        // password: "required|string",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
    changePasswordValidation
};
