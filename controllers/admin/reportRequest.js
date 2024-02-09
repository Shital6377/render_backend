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
const allFiled = [
    "from_user_id",
    "to_user_id",
    "is_active",
    "from_user.user_name",
    "to_user.user_name",
    "createdAt",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const get = (async (req, res) => {
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
        const contactUsData = await report_request_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "from_user_id",
                    foreignField: "_id",
                    as: "from_user",
                },
            },
            {
                $unwind: { path: "$from_user", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to_user_id",
                    foreignField: "_id",
                    as: "to_user",
                },
            },
            {
                $unwind: { path: "$to_user", preserveNullAndEmptyArrays: true },
            },
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
            message: 'Report Request' + process.env.APP_GET_MESSAGE,
            data: (contactUsData).length > 0 ? contactUsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Report Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const editStatus = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const { id, status } = req.body;
    const ids = new mongoose_1.default.Types.ObjectId(id);
    report_request_model_1.default.findByIdAndUpdate(ids, { is_active: status }, function (err) {
        if (err) {
            const sendResponse = {
                message: err.message,
            };
            logger.info(err);
            session.endSession();
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        else {
            const responseData = {
                message: 'Report Request' + process.env.APP_UPDATE_MESSAGE,
                data: {},
            };
            return responseMiddleware_1.default.sendSuccess(req, res, responseData);
        }
    });
});
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await report_request_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Report Request' + process.env.APP_DELETE_MESSAGE,
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
        logger.info("Report Request destroy");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    get,
    editStatus,
    destroy
};
