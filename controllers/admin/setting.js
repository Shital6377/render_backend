"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const setting_model_1 = __importDefault(require("../../models/setting-model"));
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
        const { search, per_page, page, sort_field, sort_direction, status } = req.query;
        let filterText = {};
        let filterTextStatus = {};
        let filterTextValue = search;
        let orders = { 'createdAt': -1 };
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        if (sort_field) {
            orders[sort_field] = (sort_direction == 'ascend') ? 1 : -1;
        }
        if (filterTextValue) {
            filterText = {
                $or: [
                    { setting_name: { $regex: `${filterTextValue}`, $options: "i" } },
                    { setting_value: { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        const settingsData = await setting_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "setting_name": 1,
                    "setting_value": 1,
                    "createdAt": 1,
                }
            },
            { $match: filterTextStatus },
            { $match: filterText },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: 'createdAt' }],
                    docs: [{ $addFields: { _id: '$_id' } }],
                },
            },
            { $unwind: '$total' },
            {
                $project: {
                    docs: {
                        $slice: ['$docs', perPage * pageFind, {
                                $ifNull: [perPage, '$total.createdAt']
                            }]
                    },
                    total: '$total.createdAt',
                    limit: { $literal: perPage },
                    page: { $literal: (pageFind + 1) },
                    pages: { $ceil: { $divide: ['$total.createdAt', perPage] } },
                },
            },
        ]);
        const sendResponse = {
            message: 'Setting' + process.env.APP_GET_MESSAGE,
            data: settingsData.length > 0 ? settingsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Setting' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await setting_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Setting' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Setting' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// =================================== Edit the Record Data ==================================
// *******************************************************************************************
const getData = (async (id) => {
    const settingsData = await setting_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        {
            $project: {
                "_id": 1,
                "setting_name": 1,
                "setting_value": 1,
                "createdAt": 1,
            }
        },
    ]);
    return settingsData.length > 0 ? settingsData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Setting' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Setting' + process.env.APP_EDIT_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ================================= Change Status of Record =================================
// *******************************************************************************************
const changeStatus = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // not used this function ?
        let id = req.body.id;
        let status = req.body.status;
        const settingsData = await setting_model_1.default.findOne({ _id: id });
        // settingsData.is_active = status;
        await settingsData.save();
        const message = `Settings status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
        const responseData = {
            message: message,
            data: true,
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
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
        let id = req.body.id;
        const { setting_name, setting_value, } = req.body;
        let settingsData = {};
        let message;
        if (id) {
            settingsData = await setting_model_1.default.findOne({ _id: id });
            message = 'Setting' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            settingsData = await new setting_model_1.default();
            message = 'Setting' + process.env.APP_STORE_MESSAGE;
        }
        settingsData.setting_name = setting_name;
        settingsData.setting_value = setting_value;
        await settingsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(settingsData._id),
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Setting' + process.env.APP_STORE_MESSAGE);
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
    changeStatus,
    edit,
    destroy,
};
