"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const review_model_1 = __importDefault(require("../../models/review-model"));
const getByVendorId = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { search, page, vendor_id, per_page } = req.body;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText = {
            vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
        };
        let countData = await review_model_1.default.count(filterText);
        const serviceData = await review_model_1.default.aggregate([
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    rating: 1,
                    review: 1,
                    rating_overall: 1,
                    "customerData.user_name": 1,
                    "customerData.profile_photo": 1,
                    "createdAt": 1,
                    "reviewDate": {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        let bidServiceData = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (serviceData.length > 0) {
            // await Promise.all(serviceData.map(async (item: any) => {
            if (serviceData[0].vendor_id) {
                let reviewData = await review_model_1.default.aggregate([
                    {
                        $match: {
                            'vendor_id': serviceData[0].vendor_id,
                            'createdAt': { $gte: sixMonthsAgo }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            rating_overall_data: { $sum: "$rating_overall" },
                            count: { $sum: 1 } // for no. of documents count
                        }
                    }
                ]);
                let reviewDataCount = await review_model_1.default.aggregate([
                    {
                        $match: {
                            'vendor_id': serviceData[0].vendor_id,
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 } // for no. of documents count
                        }
                    }
                ]);
                bidServiceData["rating_calculation"] = reviewData[0]?.rating_overall_data / reviewData[0]?.count;
                bidServiceData["rating_total_count"] = reviewDataCount[0]?.count;
            }
        }
        const sendResponse = {
            message: 'Review' + process.env.APP_GET_MESSAGE,
            data: {
                data: (serviceData.length) > 0 ? serviceData : [],
                total: countData,
                totalRating: bidServiceData
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
        logger.info('Review' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    getByVendorId,
};
