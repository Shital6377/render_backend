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
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { search, page, from_date, to_date, per_page, sort_direction, sort_field } = req.query;
        let filterText = {
            vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
        };
        let filterDate = {};
        let filterTextValue = search;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
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
                    { "userData.first_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "userData.last_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "vendorData.wallet_amount": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        if (from_date && to_date) {
            filterDate = {
                createdAt: {
                    $gte: new Date(from_date.toString()),
                    $lte: new Date(to_date.toString())
                }
            };
        }
        let countData = await my_earning_model_1.default.aggregate([
            {
                $match: filterDate
            },
            { $match: filterText },
            { $group: { _id: "$_id" } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        let countServiceRequest = await my_earning_model_1.default.aggregate([
            {
                $match: {
                    vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
                }
            },
            { $group: { _id: "$_id" } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        let countServiceRequestAmount = await my_earning_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "vendor_id": 1,
                    "amount": 1,
                    "status": 1
                }
            },
            {
                $match: {
                    vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
                }
            },
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
                    from: "service_requests",
                    localField: "bid_id",
                    foreignField: "selected_bid_id",
                    as: "serviceRequestData",
                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "serviceRequestData._id": { $toString: "$serviceRequestData._id" }
                }
            },
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
                    from: "cards",
                    localField: "card_id",
                    foreignField: "_id",
                    as: "cardData",
                },
            },
            { $unwind: { path: "$cardData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": 1,
                    "bid_id": 1,
                    "card_id": 1,
                    "user_id": 1,
                    "vendor_id": 1,
                    "old_wallet_amount": 1,
                    "new_wallet_amount": 1,
                    "received_amount": 1,
                    "status": 1,
                    "transfer_reference_id": 1,
                    "createdAt": 1,
                    "userData.first_name": 1,
                    "userData.last_name": 1,
                    "userData.user_name": 1,
                    "userData.wallet_amount": 1,
                    "bidData": 1,
                    "cardData": 1,
                    "vendorData.user_name": 1,
                    "vendorData.wallet_amount": 1,
                    "admin_percentage": 1,
                    "vendor_percentage": 1,
                    "sp_received_amount": 1,
                    "admin_received_amount": 1,
                    "amount": 1,
                    "serviceRequestData._id": 1,
                    "serviceRequestData.request_id": 1,
                    "serviceRequestData.slug": 1
                }
            },
            { $match: filterText },
            {
                $match: filterDate
            },
            { $sort: orders },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        let countServiceRequestAmountSum = 0;
        if (countServiceRequestAmount) {
            countServiceRequestAmount.map((item) => {
                if (Number(item.status) === 9) {
                    countServiceRequestAmountSum = Number(countServiceRequestAmountSum) + Number(item.amount);
                }
            });
        }
        const sendResponse = {
            message: 'MyEarning' + process.env.APP_GET_MESSAGE,
            data: {
                data: MyEarningData.length > 0 ? MyEarningData : [],
                total: countData.length > 0 ? countData[0]?.count : 0,
                countServiceRequest: countServiceRequest.length > 0 ? countServiceRequest[0]?.count : 0,
                countServiceRequestAmount: countServiceRequestAmountSum,
                countServiceRequestAmountSing: '$',
            }
        };
        // console.log(sendResponse)
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('MyEarning' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const moneyCollected = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = '9';
        const assetsData = await my_earning_model_1.default.findOne({ _id: id });
        assetsData.status = status;
        await assetsData.save();
        const message = `Congress money Collected Successfully`;
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
// Export default
exports.default = {
    get,
    moneyCollected
};
