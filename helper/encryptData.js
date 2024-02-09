"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const algorithm = process.env.algorithm;
const SecuritykeyEnc = process.env.SecuritykeyEnc;
const initVectorEnc = process.env.initVectorEnc;
const encryptedDataResponse = (async (data) => {
    if (algorithm && initVectorEnc && SecuritykeyEnc) {
        const cipher = crypto_1.default.createCipheriv(algorithm, SecuritykeyEnc, initVectorEnc);
        const message = JSON.stringify(data);
        let encryptedData = cipher.update(message, "utf-8", "base64");
        encryptedData += cipher.final("base64");
        const mac = crypto_1.default.createHmac('sha256', SecuritykeyEnc)
            .update(Buffer.from(Buffer.from(initVectorEnc).toString("base64") + encryptedData, "utf-8").toString())
            .digest('hex');
        var response = {
            'mac': mac,
            'value': encryptedData
        };
        return response;
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const EncryptedData = (async (req, res, data) => {
    if (req.headers.env) {
        if (req.headers.env == 'jm_developer') {
            return data;
        }
        else {
            return await encryptedDataResponse(data);
        }
    }
    else {
        return await encryptedDataResponse(data);
    }
});
exports.default = {
    EncryptedData
};
