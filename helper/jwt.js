"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randomstring_1 = __importDefault(require("randomstring"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Errors
const errors = {
    validation: 'JSON-web-token validation failed.',
};
// Constants
const secret = process.env.JWT_SECRET || randomstring_1.default.generate(100);
const options = { expiresIn: process.env.JWT_EXP };
function sign(data) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(data, secret, options, (err, token) => {
            err ? reject(err) : resolve(token || '');
        });
    });
}
function decode(jwt) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.verify(jwt, secret, (err, decoded) => {
            return err ? rej(errors.validation) : res(decoded);
        });
    });
}
// Export default
exports.default = {
    sign,
    decode,
};
