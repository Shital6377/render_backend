"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const report_request_model_1 = __importDefault(require("../../models/report-request.model"));
// ***************************************report user and provide****************************************************
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { from_user_id, to_user_id } = req.body;
        let reportUserData = await new report_request_model_1.default();
        reportUserData.from_user_id = new mongoose_1.default.Types.ObjectId(from_user_id);
        reportUserData.to_user_id = new mongoose_1.default.Types.ObjectId(to_user_id);
        await reportUserData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: 'Report Request' + process.env.APP_STORE_MESSAGE,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Report Request' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// Export default
exports.default = {
    store
};
