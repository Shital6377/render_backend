"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const cms_model_1 = __importDefault(require("../../models/cms-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req, res) => {
    console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
    try {
        const data = await cms_model_1.default.find();
        let fees_map = {};
        fees_map = await new Map(data.map((values) => [
            values.key, values.value
        ]));
        let feesMapArray = await Object.fromEntries(fees_map.entries());
        console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
        const sendResponse = {
            data: feesMapArray ? feesMapArray : {},
            message: 'CMS' + ' ' + process.env.APP_GET_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
        const sendResponse = {
            message: err.message,
        };
        logger.info('CMS' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { settings, info, vibration, calibration, } = req.body;
        await cms_model_1.default.updateOne({ key: 'SETTINGS' }, { $set: { value: settings } });
        await cms_model_1.default.updateOne({ key: 'INFO' }, { $set: { value: info } });
        await cms_model_1.default.updateOne({ key: 'VIBRATION' }, { $set: { value: vibration } });
        await cms_model_1.default.updateOne({ key: 'CALIBRATION' }, { $set: { value: calibration } });
        const sendResponse = {
            status: 200,
            message: 'CMS' + ' ' + process.env.APP_UPDATE_MESSAGE
        };
        await session.commitTransaction();
        await session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('CMS' + ' ' + process.env.APP_UPDATE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    get,
    store,
};
