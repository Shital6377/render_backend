"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const user_model_1 = __importDefault(require("../../models/user-model"));
const commisstion_history_1 = __importDefault(require("../../models/commisstion-history"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const allFiled = [
    "_id",
    "current_commission",
    "old_commission",
    "commission_sing",
    "createdAt",
    "userData._id",
    "userData.type",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
    "adminData._id",
    "adminData.first_name",
    "adminData.last_name",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { user_id, current_commission, old_commission, commission_sing } = req.body;
        const admin_id = req.admin._id;
        let commissionData = {};
        let message;
        commissionData = await new commisstion_history_1.default();
        message = 'Commission' + process.env.APP_STORE_MESSAGE;
        commissionData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        commissionData.current_commission = current_commission;
        commissionData.old_commission = old_commission;
        commissionData.commission_sing = commission_sing;
        commissionData.admin_id = new mongoose_1.default.Types.ObjectId(admin_id);
        await commissionData.save();
        const userData = await user_model_1.default.findOne({ _id: user_id });
        userData.current_commission = current_commission;
        userData.commission_sing = commission_sing;
        await userData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Commission' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const getCommissionHistory = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText = {};
        let filterTextValue = search;
        let orders = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        if (filterTextValue) {
            let filterTextField = [];
            await allFiled.map(function async(filed) {
                let filedData = {
                    [filed]: {
                        $regex: `${filterTextValue}`, $options: "i"
                    }
                };
                filterTextField.push(filedData);
            });
            filterText = { $or: filterTextField };
            if (mongoose_1.default.Types.ObjectId.isValid(filterTextValue)) {
                filterText = {
                    $or: [
                        { _id: new mongoose_1.default.Types.ObjectId(filterTextValue) },
                    ],
                };
            }
        }
        const commissionData = await commisstion_history_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $project: project },
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
            message: 'Commission' + process.env.APP_GET_MESSAGE,
            data: commissionData.length > 0 ? commissionData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Commission' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    getCommissionHistory,
    store
};
