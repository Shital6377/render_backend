"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const training_material_model_1 = __importDefault(require("../../models/training-material-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { search, page, per_page, sort_field, sort_direction } = req.query;
        let filterText = {};
        let filterTextValue = search;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && Number(page) > 0) ? (Number(Number(page) - 1) * Number(perPage)) : 0;
        let orders = {};
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { type: { $regex: `${filterTextValue}`, $options: "i" } },
                    { url: { $regex: `${filterTextValue}`, $options: "i" } },
                    { type: { $regex: `${filterTextValue}`, $options: "i" } },
                    { title: { $regex: `${filterTextValue}`, $options: "i" } },
                    { estimated_maintenance_costs: { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        let countData = await training_material_model_1.default.aggregate([
            { $match: filterText },
            commonFunction_1.default.isActive(),
            { $group: { _id: null, myCount: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]);
        const trainingMaterialData = await training_material_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "type": 1,
                    "url": 1,
                    "title": 1,
                    "description": 1,
                    "video": 1,
                    "doc": 1,
                    "is_active": 1,
                    "image": 1,
                    "createdAt": 1,
                }
            },
            { $match: filterText },
            commonFunction_1.default.isActive(),
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
            { $sort: orders },
        ]);
        const sendResponse = {
            message: 'Training Material' + process.env.APP_GET_MESSAGE,
            data: {
                data: trainingMaterialData.length > 0 ? trainingMaterialData : [],
                total: countData[0]?.myCount,
            }
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Training Material' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    get
};
