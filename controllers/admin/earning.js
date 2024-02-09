"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const my_earning_model_1 = __importDefault(require("../../models/my-earning-model"));
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "_id",
    "bid_id",
    "card_id",
    "user_id",
    "vendor_id",
    "old_wallet_amount",
    "new_wallet_amount",
    "amount",
    "sp_received_amount",
    "admin_received_amount",
    "status",
    "transfer_reference_id",
    "createdAt",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
    "userData.wallet_amount",
    // "bidData.service_request_id",
    "bidData._id",
    "bidData.currency",
    "bidData.amount",
    "bidData.delivery_timeframe",
    "bidData.validity",
    "bidData.bidder_note",
    "bidData.bidder_signature",
    "bidData.request_id",
    "vendorData.first_name",
    "vendorData.last_name",
    "vendorData.user_name",
    "vendorData.wallet_amount",
    "admin_percentage",
    "vendor_percentage",
    "serviceRequestData.request_id"
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
        const { search, per_page, page, sort_field, sort_direction, type, from_date, to_date } = req.query;
        let filterText = {};
        let filterDate = {};
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
                        { _id: { $regex: `${new mongoose_1.default.Types.ObjectId(filterTextValue)}`, $options: "i" } },
                    ],
                };
            }
        }
        if (from_date && to_date) {
            filterDate = {
                createdAt: {
                    $gte: new Date(from_date.toString()),
                    $lte: new Date(to_date.toString())
                }
            };
        }
        const totalAdminSum = await my_earning_model_1.default.aggregate([
            // { $match: { status: "9" } },
            { $match: filterText },
            { $match: filterDate },
            {
                $group: {
                    _id: null,
                    totalReceivedAmount: {
                        $sum: {
                            $toDouble: "$admin_received_amount"
                        }
                    }
                }
            }
        ]);
        const MyEarningData = await my_earning_model_1.default.aggregate([
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
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "bids",
                    localField: "bid_id",
                    foreignField: "_id",
                    as: "bidData",
                },
            },
            { $unwind: { path: "$bidData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "service_requests",
                    localField: "bid_id",
                    foreignField: "selected_bid_id",
                    as: "serviceRequestData",
                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    ...project,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                }
            },
            { $match: filterText },
            { $match: filterDate },
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
        const datas = {
            totalAdminSum: (totalAdminSum[0]) ? Math.round(totalAdminSum[0].totalReceivedAmount) : 0,
            data: MyEarningData.length > 0 ? MyEarningData[0] : {},
        };
        const sendResponse = {
            message: 'My Earning' + process.env.APP_GET_MESSAGE,
            data: datas
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('My Earning' + process.env.APP_GET_MESSAGE);
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
