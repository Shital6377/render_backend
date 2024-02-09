"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAdmin = void 0;
const jwt_1 = __importDefault(require("../helper/jwt"));
const responseMiddleware_1 = __importDefault(require("../helper/responseMiddleware"));
const mongoose_1 = __importDefault(require("mongoose"));
const admin_token_model_1 = __importDefault(require("../models/admin-token-model"));
const admin_model_1 = __importDefault(require("../models/admin-model"));
// Constants
/**
 * Middleware to verify if user is an admin.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
async function authAdmin(req, res, next) {
    try {
        // Get json-web-token
        const jwt = req.headers['authorization'];
        if (!jwt) {
            const sendResponse = {
                error: 'unauthorized',
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        else {
            const token = jwt.split(" ")[1];
            // Make sure user is authorized
            const clientData = await jwt_1.default.decode(token);
            if (!!clientData) {
                //@ts-ignore
                // req.user = clientData;
                let gettoken = await admin_token_model_1.default.findOne({
                    admin_id: new mongoose_1.default.Types.ObjectId(clientData.admin_id),
                    token: token
                });
                const admin = await admin_model_1.default.findById(clientData.admin_id).select("_id first_name last_name email");
                //@ts-ignore
                req.admin = admin;
                if (gettoken) {
                    next();
                }
                else {
                    const sendResponse = {
                        error: 'unauthorized',
                    };
                    return responseMiddleware_1.default.sendAuthError(res, sendResponse);
                }
            }
            else {
                const sendResponse = {
                    error: 'unauthorized',
                };
                return responseMiddleware_1.default.sendAuthError(res, sendResponse);
            }
        }
    }
    catch (err) {
        const sendResponse = {
            error: 'unauthorized',
        };
        return responseMiddleware_1.default.sendAuthError(res, sendResponse);
    }
}
exports.authAdmin = authAdmin;
;
