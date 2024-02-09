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
        "location": "required",
        "type": "required",
        "service_type_id": 'required',
        "asset_id": 'required',
        "detail": 'required',
        // "photos":'required',
        "contact_no": 'required',
        "priority": 'required',
        "schedule_date": [{ "required_if": ['type', "2"] }]
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const RateToSp = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
        "workmanship": "required",
        "materials": "required",
        "timeframe": "required",
        "behavior": "required",
        "rating": "required",
        "review": "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const closeRequest = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
        "reason": "required",
        "note": "required"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const getBySlug = async (req, res, next) => {
    const ValidationRule = {
        "slug": "required",
    };
    validate_1.default.validatorUtilWithCallbackQuery(ValidationRule, {}, req, res, next);
};
const getByServiceReqId = async (req, res, next) => {
    const ValidationRule = {
        "service_request_id": "required",
    };
    validate_1.default.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};
const raiseDisputeValidation = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
        "category": "required",
        "root_cause": "required",
        "damages": "required",
        "action": "required"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const updateDispute = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "id": "required",
        "status": 'required'
        // "update":"required"
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const complishmentReportValidation = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
        "user_id": "required",
        "completion_date": "required",
        "note": "required",
        "issue": "required",
        "customer_note": "required",
        // "photo":"required",
        // "document":"required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const completed = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
        "status": "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
const disputeConatctAdmin = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "service_request_id": "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
    RateToSp,
    closeRequest,
    getBySlug,
    getByServiceReqId,
    raiseDisputeValidation,
    updateDispute,
    complishmentReportValidation,
    completed,
    disputeConatctAdmin
};
