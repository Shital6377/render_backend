"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const service_type_model_1 = __importDefault(require("../../models/service-type-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const allFiled = [
    "_id",
    "name",
    "icon",
    "description",
    "is_active",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const getlist = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let orders = { 'createdAt': -1 };
        const serviceTypeData = await service_type_model_1.default.aggregate([
            { $project: project },
            { $sort: orders },
            commonFunction_1.default.isActive(),
        ]);
        const sendResponse = {
            message: 'Service Type' + process.env.APP_GET_MESSAGE,
            data: serviceTypeData.length > 0 ? serviceTypeData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Type' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    getlist
};
