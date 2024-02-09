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
        "service_request_id": 'required',
        "currency": "required",
        "amount": "required",
        "delivery_timeframe": "required",
        "validity": "required",
        // "other_conditions": "required",
        // "bidder_note": "required",
        "bidder_signature": "required",
        // "photos": "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const bidAcceptValidation = async (req, res, next) => {
    const validationRule = {
        "id": 'required|string',
        "comments": 'required|string',
        "upload_signature": 'required'
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
    bidAcceptValidation
};
