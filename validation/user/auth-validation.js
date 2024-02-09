"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const register = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "email": "required|string|email",
        // "email": "required|string|email|exist:users,email," + id,
        "first_name": "required|string",
        "last_name": "required|string",
        "token": "required|string",
        "type": "required|string",
        "user_name": "required|string|exist:users,user_name," + id,
        // mobile_no: "required|string|exist:users,mobile_no," + id,
        "password": "required|string",
        "company_name": [{ "required_if": ['type', "2"] }],
        "service_type_id": [{ "required_if": ['type', "2"] }]
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const profile = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        email: "required|string|email|exist:users,email," + id,
        first_name: "required|string",
        last_name: "required|string",
        user_name: "required|string|exist:users,user_name," + id,
        mobile_no: "required|string|exist:users,mobile_no," + id,
        date_of_birth: "required",
        location: "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const login = async (req, res, next) => {
    const validationRule = {
        email: "required|string",
        password: "required|string",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const changePassword = async (req, res, next) => {
    const validationRule = {
        old_password: "required|string",
        password: "required|string|min:6|confirmed",
        password_confirmation: "required|string|min:6",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const uploadBrochure = async (req, res, next) => {
    const validationRule = {
        upload_brochure: "required"
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
const verifyMobileNumber = async (req, res, next) => {
    const validationRule = {
    // mobile_no: "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const verifyOtp = async (req, res, next) => {
    const validationRule = {
        otp: "required|string|min:4|max:4",
        token: "required"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    login,
    register,
    changePassword,
    profile,
    uploadBrochure,
    emailValidation,
    resetPassword,
    verifyMobileNumber,
    verifyOtp
};
