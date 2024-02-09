"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encryptData_1 = __importDefault(require("./encryptData"));
const sendAuthError = (async (res, error) => {
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": error.error,
        "data": []
    };
    res.status(401).send(dataResponse);
});
const sendError = (async (res, error) => {
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": error.message,
        "data": {}
    };
    res.status(422).send(dataResponse);
});
const sendValidationError = (async (res, error) => {
    // var errors = Object.values(error);
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": 'this field is required',
        "data": error
    };
    res.status(422).send(dataResponse);
});
const sendSuccess = (async (req, res, data) => {
    let dataResponse = {
        "status": 200,
        "message": data.message,
        "data": data.data
    };
    let response = await encryptData_1.default.EncryptedData(req, res, dataResponse);
    res.status(200).send(response);
});
const sendResponse = (async (res, data) => {
    let dataResponse = {
        "status": 200,
        "message": data.message,
        "data": data.data
    };
    res.status(200).send(dataResponse);
});
const sendInternalError = (async (res, data) => {
    res.status(500).send(data);
});
const sendCustomResponse = async (res, data, statusCode) => {
    res.status(statusCode).send(data);
};
exports.default = {
    sendResponse,
    sendError,
    sendAuthError,
    sendSuccess,
    sendValidationError,
    sendInternalError,
    sendCustomResponse
};
