"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const jwt_1 = __importDefault(require("../helper/jwt"));
const responseMiddleware_1 = __importDefault(require("../helper/responseMiddleware"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_token_model_1 = __importDefault(require("../models/user-token-model"));
const user_model_1 = __importDefault(require("../models/user-model"));
// Constants
/**
 * Middleware to verify if user is an Customer.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
async function authUser(req, res, next) {
    try {
        // Get json-web-token
        const jwt = req.headers["authorization"];
        if (!jwt) {
            const sendResponse = {
                error: "unauthorized",
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        else {
            const token = jwt.split(" ")[1];
            // Make sure user is authorized
            const clientData = await jwt_1.default.decode(token);
            if (!!clientData) {
                //@ts-ignore
                let gettoken = await user_token_model_1.default.findOne({
                    user_id: new mongoose_1.default.Types.ObjectId(clientData.user_id),
                    token: token,
                });
                const user = await user_model_1.default.findById(clientData.user_id).select("_id first_name last_name email type");
                //@ts-ignore
                req.user = user;
                if (gettoken) {
                    next();
                }
                else {
                    const sendResponse = {
                        error: "unauthorized",
                    };
                    return responseMiddleware_1.default.sendAuthError(res, sendResponse);
                }
            }
            else {
                const sendResponse = {
                    error: "unauthorized",
                };
                return responseMiddleware_1.default.sendAuthError(res, sendResponse);
            }
        }
    }
    catch (err) {
        const sendResponse = {
            error: "unauthorized",
        };
        return responseMiddleware_1.default.sendAuthError(res, sendResponse);
    }
}
exports.authUser = authUser;
