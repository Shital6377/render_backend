"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const our_contact_us_model_1 = __importDefault(require("../../models/our-contact-us-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req, res) => {
    try {
        const data = await our_contact_us_model_1.default.find();
        let fees_map = {};
        fees_map = await new Map(data.map((values) => [
            values.key, values.value
        ]));
        let feesMapArray = await Object.fromEntries(fees_map.entries());
        const sendResponse = {
            data: feesMapArray,
            message: 'Our Contact Us' + process.env.APP_GET_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Our Contact Us' + process.env.APP_GET_MESSAGE);
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
        const { contact_no, email, website, location, admin_email } = req.body;
        await our_contact_us_model_1.default.updateOne({ key: 'contact_no' }, { $set: { value: contact_no } });
        await our_contact_us_model_1.default.updateOne({ key: 'email' }, { $set: { value: email } });
        await our_contact_us_model_1.default.updateOne({ key: 'website' }, { $set: { value: website } });
        await our_contact_us_model_1.default.updateOne({ key: 'location' }, { $set: { value: location } });
        await our_contact_us_model_1.default.updateOne({ key: 'admin_email' }, { $set: { value: admin_email } });
        await session.commitTransaction();
        await session.endSession();
        const sendResponse = {
            message: 'Our Contact Us' + process.env.APP_STORE_MESSAGE
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Our Contact Us' + process.env.APP_STORE_MESSAGE);
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
