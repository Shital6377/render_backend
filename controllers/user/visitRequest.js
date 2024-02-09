"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const visit_request_model_1 = __importDefault(require("../../models/visit-request-model"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Visit Request By Service Req. ID==================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const get = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { search, page, per_page } = req.body;
        let filterTextValue = search;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText = {};
        let typeName = '';
        if (Number(req.user.type) === 1) {
            filterText = {
                user_id: new mongoose_1.default.Types.ObjectId(user_id)
            };
        }
        if (Number(req.user.type) === 2) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(user_id)
            };
        }
        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { "serviceRequestData.slug": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.request_id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.status": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.serviceTypeData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.serviceTypeData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.assetsFacilityTypesData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.assetsFacilityTypesData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        let countData = await visit_request_model_1.default.aggregate([
            {
                $lookup: {
                    from: "service_requests",
                    localField: "bid_id",
                    foreignField: "selected_bid_id",
                    as: "serviceRequestData",
                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            { $group: { _id: "$_id" } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        const serviceData = await visit_request_model_1.default.aggregate([
            {
                $lookup: {
                    from: "service_requests",
                    localField: "service_request_id",
                    foreignField: "_id",
                    as: "serviceRequestData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "service_types",
                                localField: "service_type_id",
                                foreignField: "_id",
                                as: "serviceTypeData",
                            },
                        },
                        {
                            $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "assets",
                                localField: "assets_id",
                                foreignField: "_id",
                                as: "assetsFacilityTypesData",
                            },
                        },
                        { $unwind: { path: "$assetsFacilityTypesData", preserveNullAndEmptyArrays: true } },
                    ],
                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            {
                $project: {
                    "_id": 1,
                    "updatedAt": 1,
                    "serviceRequestData._id": 1,
                    "serviceRequestData.request_id": 1,
                    "serviceRequestData.status": 1,
                    "serviceRequestData.slug": 1,
                    "serviceRequestData.createdAt": 1,
                    "serviceRequestData.schedule_date": 1,
                    "serviceRequestData.serviceTypeData._id": 1,
                    "serviceRequestData.serviceTypeData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData._id": 1,
                },
            },
            { $sort: { 'updatedAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        const sendResponse = {
            message: 'Site Visit' + process.env.APP_GET_MESSAGE,
            data: {
                data: serviceData.length > 0 ? serviceData : [],
                total: countData.length > 0 ? countData[0].count : 0,
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
        logger.info('Site Visit' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const gejjjt = async (req, res) => {
    try {
        const customer = req.user;
        const { id } = req.params;
        const visitRequest = await visit_request_model_1.default.aggregate([
            // {
            //     $match: {
            //         user_id: new mongoose.Types.ObjectId(customer.id),
            //     },
            // },
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
                    "_id": 1,
                    "serviceRequestData._id": 1,
                    "serviceRequestData.request_id": 1
                }
            },
        ]);
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length ? visitRequest : {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getByServiceReqId = async (req, res) => {
    try {
        const customer = req.user;
        const { id } = req.params;
        const visitRequest = await visit_request_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $match: {
                    service_request_id: new mongoose_1.default.Types.ObjectId(id),
                },
            },
        ]);
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length ? visitRequest[0] : {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const create = async (req, res) => {
    try {
        const vendor = req.user;
        const { service_request_id, interest, your_message, justification, response_date, platform_statement } = req.body;
        let visitReqData = {};
        let message;
        const serviceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        if (serviceReq) {
            const requestFound = await visit_request_model_1.default.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                vendor_id: vendor._id,
                            },
                            {
                                service_request_id: new mongoose_1.default.Types.ObjectId(service_request_id),
                            },
                        ],
                    },
                },
            ]);
            if (requestFound[0]) {
                const sendResponse = {
                    message: process.env.APP_REQ_VISITED_MESSAGE,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: process.env.APP_SR_NOT_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        visitReqData = new visit_request_model_1.default();
        message = 'Requested Site Visit' + process.env.APP_STORE_MESSAGE;
        visitReqData.service_request_id = serviceReq._id;
        visitReqData.user_id = serviceReq.user_id;
        visitReqData.vendor_id = vendor._id;
        visitReqData.interest = interest;
        visitReqData.your_message = your_message;
        visitReqData.justification = justification;
        visitReqData.response_date = new Date(response_date);
        visitReqData.platform_statement = platform_statement;
        await visitReqData.save();
        if (visitReqData) {
            // start here Push 
            let pushTitle = `This SR Id is  ${serviceReq._id} have new Site Visit`;
            let message = `Site Visit ${your_message}`;
            let payload = visitReqData;
            let userIdNotifiy = serviceReq.user_id;
            console.log(serviceReq.user_id);
            await notification_model_1.default.create({
                user_id: userIdNotifiy,
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            });
            const userNotification = await user_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(userIdNotifiy)
            });
            let getToken = (await user_token_model_1.default.find({
                user_id: new mongoose_1.default.Types.ObjectId(userIdNotifiy),
                firebase_token: { $ne: null }
            })).map(value => value.firebase_token);
            console.log(getToken);
            if (userNotification && userNotification.firebase_is_active) {
                try {
                    let dataStore = getToken;
                    let notificationData = {
                        "type": 1,
                        "title": pushTitle,
                        "message": message,
                        "extraData": JSON.stringify(payload),
                        "updatedAt": new Date().toString(),
                    };
                    let fcmData = {
                        "subject": pushTitle,
                        "content": message,
                        "data": notificationData,
                        "image": ""
                    };
                    let token = dataStore;
                    await firebase_1.default.sendPushNotification(token, fcmData);
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }
        const responseData = {
            message: message,
            data: await visitReqData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Requested Site Visit' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getAllServiceRequest = async (req, res) => {
    try {
        const visitRequest = await visit_request_model_1.default.aggregate([]);
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length > 0 ? visitRequest : {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
exports.default = {
    getByServiceReqId,
    get,
    create,
    getAllServiceRequest,
};
