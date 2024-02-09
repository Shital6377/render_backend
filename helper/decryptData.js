"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const algorithm = process.env.algorithm;
const securitykeyDec = process.env.SecuritykeyDec;
const initVectorDec = process.env.initVectorDec;
const DecryptedDataResponse = (async (req, res, next) => {
    if (algorithm && initVectorDec && securitykeyDec) {
        const decipher = crypto_1.default.createDecipheriv(algorithm, securitykeyDec, initVectorDec);
        let encryptedData;
        if (req.body.value) {
            encryptedData = req.body.value;
            let decryptedData = decipher.update(encryptedData, "base64", "utf-8");
            decryptedData += decipher.final("utf8");
            req.body = JSON.parse(decryptedData);
        }
        next();
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DecryptedData = (async (req, res, next) => {
    if (req.headers.env) {
        if (req.headers.env == 'jm_developer') {
            next();
        }
        else {
            return DecryptedDataResponse(req, res, next);
        }
    }
    else {
        return DecryptedDataResponse(req, res, next);
    }
});
exports.default = {
    DecryptedData,
};
