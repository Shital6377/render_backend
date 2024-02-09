"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const login = async (req, res, next) => {
    const validationRule = {
        "email": "required|string|email",
        "password": "required|string"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const changePassword = async (req, res, next) => {
    const validationRule = {
        "oldpassword": "required|string",
        "password": "required|string|min:6|confirmed",
        "password_confirmation": "required|string|min:6"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const emailValidation = async (req, res, next) => {
    const validationRule = {
        "email": "required|string|email",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const resetPassword = async (req, res, next) => {
    const validationRule = {
        password: "required|string|min:6",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    login,
    changePassword,
    emailValidation,
    resetPassword,
};
