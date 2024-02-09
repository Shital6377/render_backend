"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const service_request_image_model_1 = __importDefault(require("../../models/service-request-image-model"));
const review_model_1 = __importDefault(require("../../models/review-model"));
const bid_request_model_1 = __importDefault(require("../../models/bid-request-model"));
const dispute_model_1 = __importDefault(require("../../models/dispute-model"));
const accomplishment_report_model_1 = __importDefault(require("../../models/accomplishment-report-model"));
const resubmit_service_request_model_1 = __importDefault(require("../../models/resubmit-service-request-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const accomplishment_report_model_2 = __importDefault(require("../../models/accomplishment-report-model"));
const loremIpsum = require("lorem-ipsum").loremIpsum;
const report_request_model_1 = __importDefault(require("../../models/report-request.model"));
const cancel_service_request_model_1 = __importDefault(require("../../models/cancel-service-request-model"));
const our_contact_us_model_1 = __importDefault(require("../../models/our-contact-us-model"));
const moment_1 = __importDefault(require("moment"));
// *******************************************************************************************
// ================================= Store/Edit Service Request In Database ==================
// *******************************************************************************************
const getData = async (id) => {
    const serviceReqData = await service_request_model_1.default.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        {
            $project: {
                _id: 1,
                title: 1,
                location: 1,
                user_id: 1,
                category: 1,
                sub_category: 1,
                detail: 1,
                photos: 1,
                document: 1,
                request_id: 1,
                contactNo: 1,
                priority: 1,
                schedule_date: 1,
                bid_id: 1,
                type: 1,
                is_payment_done: 1,
                createdAt: 1,
                posted_date: 1,
            },
        },
    ]);
    return (serviceReqData).length > 0 ? serviceReqData[0] : {};
};
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const user_id = req.user._id;
        const { 
        // title,
        location, type, service_type_id, asset_id, detail, photos, document, contact_no, priority, schedule_date, } = req.body;
        let serviceReqData = {};
        let message;
        let title = loremIpsum();
        if (id) {
            serviceReqData = await service_request_model_1.default.findOne({ _id: id });
            message = 'Service Request' + process.env.APP_UPDATE_MESSAGE;
            const resubmitServiceRequestData = new resubmit_service_request_model_1.default();
            resubmitServiceRequestData.service_request_id = new mongoose_1.default.Types.ObjectId(id);
            resubmitServiceRequestData.date = new Date();
            await resubmitServiceRequestData.save();
        }
        else {
            serviceReqData = new service_request_model_1.default();
            serviceReqData.request_id = await commonFunction_1.default.makeIdString(15);
            message = 'Service Request' + process.env.APP_STORE_MESSAGE;
        }
        serviceReqData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        serviceReqData.title = title;
        serviceReqData.location = location;
        serviceReqData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        serviceReqData.assets_id = new mongoose_1.default.Types.ObjectId(asset_id);
        serviceReqData.detail = detail;
        serviceReqData.contact_no = contact_no;
        serviceReqData.priority = new mongoose_1.default.Types.ObjectId(priority);
        serviceReqData.type = type;
        serviceReqData.status = 2;
        serviceReqData.slug = await commonFunction_1.default.titleToSlug(title);
        serviceReqData.schedule_date = Number(type) === 2 ? schedule_date : "";
        serviceReqData.updatedAt = new Date();
        serviceReqData.posted_date = new Date();
        // serviceReqData.createdAt = new Date()
        await serviceReqData.save();
        await service_request_image_model_1.default.deleteMany({ service_request_id: new mongoose_1.default.Types.ObjectId(serviceReqData._id), });
        if (photos) {
            photos.map(async function (img) {
                const imageData = new service_request_image_model_1.default();
                imageData.service_request_id = serviceReqData._id;
                imageData.path = img;
                imageData.type = 1; // image
                await imageData.save();
            });
        }
        if (document) {
            const imageData = new service_request_image_model_1.default();
            imageData.service_request_id = serviceReqData._id;
            imageData.path = document;
            imageData.type = 2; // document
            await imageData.save();
        }
        const getServiceReq = await getData(serviceReqData._id);
        const msg = message;
        const responseData = {
            message: message,
            data: getServiceReq,
        };
        if (getServiceReq) {
            // start here Push 
            let pushTitle = `${msg}`;
            let message = `${getServiceReq.request_id} is successfully ${id ? 'updated' : 'created'}`;
            let payload = getServiceReq;
            let userIdNotifiy = getServiceReq.user_id;
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
        await session.commitTransaction();
        await session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ====================== Get Service-Request List With Pagination And Filter ================
// *******************************************************************************************
const get = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { search, tab_type, status, type, service_type_id, assets_id, priority, page, per_page } = req.body;
        let filterTextValue = search;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText = {
            'is_active': true
        };
        let filterTextId = {};
        //  get self SRR
        console.log(req.body);
        if (Number(type) === 1) {
            filterText = {
                ...filterText,
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        //  Mobile Side  Start
        if (Number(tab_type) === 5) { // customer side current tab 
            filterText = {
                ...filterText,
                "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id),
                $and: [
                    { "bidsData.status": { $in: ["1", "2", "4"] } },
                    { "bidsData.is_active": true }
                ],
            };
        }
        if (Number(tab_type) === 6) { // customer side on goiung tab 
            filterText = {
                ...filterText,
                "srBidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id),
                $and: [{ "status": { $in: ["5", "6", "8"] } }],
            };
        }
        //  Mobile Side  Start
        if (Number(tab_type) === 1) { // customer side current tab 
            filterText = {
                ...filterText,
                $and: [{ status: { $in: ["2"] } }],
            };
        }
        if (Number(tab_type) === 2) { // customer side on goiung tab 
            filterText = {
                ...filterText,
                $and: [{ status: { $in: ["5", "6", "8"] } }],
            };
        }
        if (Number(tab_type) === 3) { // customer side cancel tab 
            filterText = {
                ...filterText,
                $and: [{ status: { $in: ["4", "7", "9", "10"] } }],
            };
        }
        if (Number(tab_type) === 4) {
            filterText = {
                ...filterText,
                "bidsData.vendor_id": { $nin: [new mongoose_1.default.Types.ObjectId(user_id)] },
                $and: [{ status: { $in: ["2", "3"] } }],
            };
        }
        if (Number(tab_type) === 7) {
            filterText = {
                ...filterText,
                "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id),
                $or: [
                    { status: { $in: ["4", "7", "9", "10"] } },
                    // { "bidsData.status": { $in: ["5"] } }
                ],
            };
        }
        if (Number(tab_type) === 9) {
            filterText = {
                ...filterText,
                "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id),
                $or: [
                    { "bidsData.status": { $in: ["5"] } }
                ],
            };
        }
        if (Number(tab_type) === 8) { // bid customer side bid wise listibng 
            filterText = {
                ...filterText,
                $and: [
                    { status: { $in: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] } },
                    { "bidsTotalData.doc.numCount": { $gt: 0 } }
                ],
            };
        }
        if (service_type_id && !assets_id) {
            filterTextId = {
                ...filterTextId,
                $or: [{ service_type_id: { $in: [new mongoose_1.default.Types.ObjectId(service_type_id)] } }]
            };
        }
        if (!service_type_id && assets_id) {
            filterTextId = {
                ...filterTextId,
                $or: [{ assets_id: { $in: [new mongoose_1.default.Types.ObjectId(assets_id)] } }]
            };
        }
        if (priority) {
            filterText = {
                ...filterText,
                $or: [{ priority: { $in: [new mongoose_1.default.Types.ObjectId(priority)] } }]
            };
        }
        if (assets_id && service_type_id) {
            filterTextId = {
                ...filterTextId,
                $and: [{ assets_id: { $in: [new mongoose_1.default.Types.ObjectId(assets_id)] } },
                    { service_type_id: { $in: [new mongoose_1.default.Types.ObjectId(service_type_id)] } }]
            };
        }
        let filterTextBlockeId = {};
        let getReportUSer = (await report_request_model_1.default.find({
            from_user_id: new mongoose_1.default.Types.ObjectId(user_id)
        })).map(value => value.to_user_id);
        if (getReportUSer) {
            filterTextBlockeId = {
                $and: [{
                        user_id: { $nin: getReportUSer },
                        vendor_id: { $nin: getReportUSer },
                    }]
            };
        }
        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { "title": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "slug": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "detail": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "contact_no": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "request_id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "status": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceTypeData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceTypeData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "assetsFacilityTypesData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "assetsFacilityTypesData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "userData.user_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "userData.first_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "userData.last_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "priorityData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "bidsData.amount": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "bidsData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "location": { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        // filterText = {
        //     ...filterText,
        //     $or: [{ 'is_active': true }]
        // };
        // console.log(filterText)
        console.log(filterText);
        let srGetData = commonFunction_1.default.srGetData();
        let countData = await service_request_model_1.default.aggregate([
            ...srGetData,
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsData",
                    pipeline: [
                        { $match: { vendor_id: new mongoose_1.default.Types.ObjectId(user_id) } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "vendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$vendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            { $unwind: { path: "$bidsData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$bidsData.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsTotalData",
                    pipeline: [
                        {
                            $match: filterTextBlockeId
                        },
                        // isActive(),
                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $match: filterText },
            { $match: filterTextId },
            { $group: { _id: "$_id" } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        const serviceData = await service_request_model_1.default.aggregate([
            ...srGetData,
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsData",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $match: { vendor_id: new mongoose_1.default.Types.ObjectId(user_id) } },
                        // { $sort: { 'createdAt': -1 } },
                        // { $limit: 1 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "vendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$vendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            { $unwind: { path: "$bidsData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$bidsData.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsTotalData",
                    pipeline: [
                        {
                            $match: filterTextBlockeId
                        },
                        // isActive(),
                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$bidsTotalData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$bidsTotalData.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "priorities",
                    localField: "priority",
                    foreignField: "_id",
                    as: "priorityData",
                },
            },
            {
                $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "service_request_files",
                    localField: "_id",
                    foreignField: "service_request_id",
                    pipeline: [
                        {
                            $match: {
                                type: "1"
                            }
                        },
                    ],
                    as: "serviceRequestImagesData",
                },
            },
            {
                $lookup: {
                    from: "service_request_files",
                    localField: "_id",
                    foreignField: "service_request_id",
                    pipeline: [
                        {
                            $match: {
                                type: "2"
                            }
                        },
                    ],
                    as: "serviceRequestDocumentData",
                },
            },
            { $match: filterText },
            { $match: filterTextId },
            { $match: filterTextBlockeId },
            { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            {
                $project: {
                    "_id": 1,
                    "title": 1,
                    "slug": 1,
                    "createdAtFormatted": {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    "serviceTypeData._id": 1,
                    "serviceTypeData.name": 1,
                    "assetsFacilityTypesData.name": 1,
                    "assetsFacilityTypesData._id": 1,
                    "request_id": 1,
                    "userData._id": 1,
                    "userData.user_name": 1,
                    "userData.profile_photo": 1,
                    "userData.last_name": 1,
                    "userData.first_name": 1,
                    "createdAt": 1,
                    "status": 1,
                    "detail": 1,
                    "is_admin_connect": 1,
                    "srBidsData.amount": 1,
                    "srBidsData.currency": 1,
                    "srBidsData.workingSPData._id": 1,
                    "srBidsData.workingSPData.user_name": 1,
                    "srBidsData.workingSPData.profile_photo": 1,
                    "srBidsData.workingSPData.last_name": 1,
                    "srBidsData.workingSPData.first_name": 1,
                    "srBidsData.workingSPData.mobile_no": 1,
                    "srBidsData.workingSPData.email": 1,
                    "srBidsData.workingSPData.userToken.token": 1,
                    "srBidsData.workingSPData.upload_brochure": 1,
                    "bidsData.vendor_id": 1,
                    "bidsData.is_active": 1,
                    "bidsData.is_selected": 1,
                    "bidsData._id": 1,
                    "bidsData.amount": 1,
                    "bidsData.status": 1,
                    "bidsData.currency": 1,
                    "bidsData.createdAt": 1,
                    "bidsData.createdAtFormatted": {
                        $dateToString: { format: "%d/%m/%Y", date: "$bidsData.createdAt" },
                    },
                    "bidsData.updatedAt": 1,
                    "bidsData.vendorData.upload_brochure": 1,
                    "bidsData.vendorData._id": 1,
                    "bidsTotalData": 1,
                    "contact_no": 1,
                    "location": 1,
                    "priority": 1,
                    "type": 1,
                    "priorityData.name": 1,
                    "priorityData._id": 1,
                    "serviceRequestImagesData.path": 1,
                    "serviceRequestDocumentData.path": 1,
                    "is_active": 1,
                    "schedule_date": 1,
                    "updatedAt": 1,
                    "close_sr_date": 1,
                    "posted_date": 1,
                    "awarded_date": 1
                },
            },
            { $sort: { 'updatedAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        // console.log(filterText)
        // console.log(serviceData)
        const sendResponse = {
            message: 'Service Request' + process.env.APP_GET_MESSAGE,
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
        logger.info('Service Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getEditData = async (id) => {
    const serviceReqData = await service_request_model_1.default.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "1"
                        }
                    },
                ],
                as: "serviceRequestImagesData",
            },
        },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "2"
                        }
                    },
                ],
                as: "serviceRequestDocumentData",
            },
        },
        { $unwind: { path: "$serviceRequestDocumentData", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                user_id: 1,
                service_type_id: 1,
                assets_id: 1,
                dispute_id: 1,
                complishment_report: 1,
                title: 1,
                slug: 1,
                location: 1,
                detail: 1,
                contact_no: 1,
                priority: 1,
                type: 1,
                request_id: 1,
                schedule_date: 1,
                status: 1,
                close_reason: 1,
                close_note: 1,
                upload_signature: 1,
                accept_bid_note: 1,
                is_deleted: 1,
                is_expired: 1,
                selected_bid_id: 1,
                complishment_report_date: 1,
                is_active: 1,
                is_payment_done: 1,
                serviceRequestImagesData: 1,
                serviceRequestDocumentData: 1
            },
        },
    ]);
    return (serviceReqData).length > 0 ? serviceReqData[0] : {};
};
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Service Request' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getEditData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_EDIT_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// =========================== Get Service Request by Id ===========================
// *******************************************************************************************
const getBySlug = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { slug } = req.query;
        let srSlugGetData = commonFunction_1.default.srSlugGetData();
        let filterTextBlockeId = {};
        let getReportUSer = (await report_request_model_1.default.find({
            from_user_id: new mongoose_1.default.Types.ObjectId(user_id)
        })).map(value => value.to_user_id);
        if (getReportUSer) {
            filterTextBlockeId = {
                $and: [{
                        user_id: { $nin: getReportUSer },
                        vendor_id: { $nin: getReportUSer },
                    }]
            };
        }
        const serviceData = await service_request_model_1.default.aggregate([
            { $match: { slug: slug } },
            ...srSlugGetData,
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsData",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $match: { vendor_id: new mongoose_1.default.Types.ObjectId(user_id) } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "serviceProvider",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "user_tokes",
                                            localField: "_id",
                                            foreignField: "user_id",
                                            as: "deviceToken",
                                        },
                                    },
                                ]
                            },
                        },
                        {
                            $unwind: {
                                path: "$serviceProvider",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "visit_requests",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "visitRequestData",
                    pipeline: [
                        { $match: { vendor_id: new mongoose_1.default.Types.ObjectId(user_id) } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "bids",
                    localField: "_id",
                    foreignField: "service_request_id",
                    as: "bidsTotalData",
                    pipeline: [
                        { $match: filterTextBlockeId },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "vendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$vendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ]
                },
            },
            {
                $lookup: {
                    from: 'cancel_reasons',
                    localField: 'close_reason',
                    foreignField: '_id',
                    as: 'closeSrReason',
                },
            },
            {
                $unwind: {
                    path: "$closeSrReason",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    "serviceTypeData._id": 1,
                    "serviceTypeData.name": 1,
                    "assetsFacilityTypesData.name": 1,
                    "assetsFacilityTypesData._id": 1,
                    "priorityData.name": 1,
                    "priorityData._id": 1,
                    "visitRequestData.your_message": 1,
                    "visitRequestData._id": 1,
                    "createdAtFormatted": {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    "request_id": 1,
                    "status": 1,
                    "is_admin_connect": 1,
                    "srBidsData.validity": 1,
                    "srBidsData.amount": 1,
                    "srBidsData.workingSPData._id": 1,
                    "srBidsData.workingSPData.user_name": 1,
                    "srBidsData.workingSPData.profile_photo": 1,
                    "srBidsData.workingSPData.location": 1,
                    "srBidsData.workingSPData.last_name": 1,
                    "srBidsData.workingSPData.first_name": 1,
                    "srBidsData.workingSPData.mobile_no": 1,
                    "srBidsData.workingSPData.email": 1,
                    "srBidsData.workingSPData.userToken.token": 1,
                    "bidsTotalData.vendorData.profile_photo": 1,
                    "srBidsData.currency": 1,
                    "location": 1,
                    "detail": 1,
                    "admin_comment": 1,
                    "slug": 1,
                    "is_review_by_sp": 1,
                    "contact_no": 1,
                    "schedule_date": 1,
                    "createdAt": 1,
                    "is_payment_done": 1,
                    "serviceRequestDocumentData.type": 1,
                    "serviceRequestDocumentData.path": 1,
                    "serviceRequestImagesData.type": 1,
                    "serviceRequestImagesData.path": 1,
                    "userData._id": 1,
                    "userData.user_name": 1,
                    "userData.first_name": 1,
                    "userData.last_name": 1,
                    "userData.profile_photo": 1,
                    "userData.email": 1,
                    "userData.location": 1,
                    "user_id": 1,
                    "type": 1,
                    "title": 1,
                    "is_active": 1,
                    "close_reason": 1,
                    "close_note": 1,
                    "closeSrReason.reson": 1,
                    "close_sr_date": 1,
                    "bidsData._id": 1,
                    "bidsData.status": 1,
                    "bidsData.is_active": 1,
                    "bidsData.updatedAt": 1,
                    "bidsData.serviceProvider._id": 1,
                    "bidsData.serviceProvider.user_name": 1,
                    "bidsData.serviceProvider.first_name": 1,
                    "bidsData.serviceProvider.last_name": 1,
                    "bidsData.serviceProvider.location": 1,
                    "bidsData.serviceProvider.profile_photo": 1,
                    "bidsData.serviceProvider.deviceToken._id": 1,
                    "bidsData.serviceProvider.deviceToken.firebase_token": 1,
                    "complishmentReportData.document": 1,
                    "posted_date": 1,
                    "awarded_date": 1,
                    "updatedAt": 1
                },
            },
        ]);
        if (serviceData.length > 0) {
            const sendResponse = {
                message: 'Service Request' + process.env.APP_GET_MESSAGE,
                data: serviceData.length > 0 ? serviceData[0] : {},
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: process.env.APP_OOPS_NO_DATA_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getReport = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { slug } = req.query;
        let srSlugGetData = commonFunction_1.default.srSlugReportData();
        const serviceData = await service_request_model_1.default.aggregate([
            { $match: { slug: slug } },
            ...srSlugGetData,
            {
                $lookup: {
                    from: 'visit_requests',
                    localField: '_id',
                    foreignField: 'service_request_id',
                    as: 'siteVisitData'
                }
            },
            // { $unwind: { path: "$siteVisitData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'resubmit_service_requests',
                    localField: '_id',
                    foreignField: 'service_request_id',
                    as: 'resubmitData'
                }
            },
            // { $unwind: { path: "$resubmitData"} },
            {
                $lookup: {
                    from: 'cancel_reasons',
                    localField: 'close_reason',
                    foreignField: '_id',
                    as: 'cancelSrDetails',
                },
            },
            {
                $unwind: {
                    path: "$cancelSrDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //     $lookup:
            //     {
            //         from: 'cancel_service_request',
            //         localField: '_id',
            //         foreignField: 'service_request_id',
            //         as: 'cancelRequestData'
            //     }
            // },
            // { $unwind: { path: "$cancelRequestData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "serviceTypeData._id": 1,
                    "serviceTypeData.name": 1,
                    "assetsFacilityTypesData.name": 1,
                    "assetsFacilityTypesData._id": 1,
                    "priorityData.name": 1,
                    "priorityData._id": 1,
                    "createdAtFormatted": {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    "request_id": 1,
                    "status": 1,
                    "srBidsData.amount": 1,
                    "srBidsData.workingSPData._id": 1,
                    "srBidsData.workingSPData.user_name": 1,
                    "srBidsData.workingSPData.profile_photo": 1,
                    "srBidsData.workingSPData.location": 1,
                    "srBidsData.workingSPData.mobile_no": 1,
                    "srBidsData.workingSPData.email": 1,
                    "srBidsData.currency": 1,
                    "location": 1,
                    "detail": 1,
                    "slug": 1,
                    "contact_no": 1,
                    "schedule_date": 1,
                    "createdAt": 1,
                    "close_sr_date": 1,
                    "is_payment_done": 1,
                    "serviceRequestDocumentData.type": 1,
                    "serviceRequestDocumentData.path": 1,
                    "serviceRequestImagesData.type": 1,
                    "serviceRequestImagesData.path": 1,
                    "userData.user_name": 1,
                    "userData.first_name": 1,
                    "userData.last_name": 1,
                    "userData.profile_photo": 1,
                    "userData.email": 1,
                    "user_id": 1,
                    "type": 1,
                    "title": 1,
                    "selected_bid_id": 1,
                    "posted_date": 1,
                    "bidsData._id": 1,
                    "bidsData.updatedAt": 1,
                    "bidsData.bidder_signature": 1,
                    "bidsData.other_conditions": 1,
                    "bidsData.bidder_note": 1,
                    "bidsData.amount": 1,
                    "bidsData.currency": 1,
                    "bidsData.status": 1,
                    "bidsData.delivery_timeframe": 1,
                    "bidsData.validity": 1,
                    "bidsData.createdAt": 1,
                    "bidsData.is_active": 1,
                    "bidsData.reject_note": 1,
                    "bidsData.reject_reason_id": 1,
                    "bidsData.rejectedBidData": 1,
                    "bidsData.srReviewData": 1,
                    "bidsData.serviceProvider._id": 1,
                    "bidsData.serviceProvider.user_name": 1,
                    "bidsData.serviceProvider.first_name": 1,
                    "bidsData.serviceProvider.last_name": 1,
                    "bidsData.serviceProvider.profile_photo": 1,
                    "bidsData.serviceProvider.deviceToken._id": 1,
                    "bidsData.serviceProvider.deviceToken.firebase_token": 1,
                    "complishmentReportData.document": 1,
                    "complishmentReportData.completion_date": 1,
                    "complishmentReportData.note": 1,
                    "complishmentReportData.issue": 1,
                    "complishmentReportData.customer_note": 1,
                    "complishmentReportData.photo": 1,
                    "siteVisitData._id": 1,
                    "siteVisitData.interest": 1,
                    "siteVisitData.vendor_id": 1,
                    "siteVisitData.justification": 1,
                    "siteVisitData.platform_statement": 1,
                    "siteVisitData.your_message": 1,
                    "siteVisitData.response_date": 1,
                    "accept_bid_note": 1,
                    "upload_signature": 1,
                    "close_reason": 1,
                    "cancelSrDetails": 1,
                    "resubmitData": 1,
                    "close_note": 1,
                    "awarded_date": 1,
                    "updatedAt": 1,
                },
            },
        ]);
        if (serviceData[0].selected_bid_id) {
            let disputeData = await dispute_model_1.default.aggregate([
                {
                    $match: {
                        'bid_id': serviceData[0].selected_bid_id
                    }
                },
                {
                    $lookup: {
                        from: 'categories_disputes',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDisputeData',
                    },
                },
                {
                    $unwind: {
                        path: "$categoryDisputeData",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        "category": 1,
                        "categoryDisputeData": 1,
                        "action": 1,
                        "bid_id": 1,
                        "createdAt": 1,
                        "damages": 1,
                        "root_cause": 1,
                        "document": 1,
                        "photo": 1,
                        "status": 1,
                        "updatedAt": 1,
                        "add_response": 1,
                        "update": 1
                    }
                }
            ]);
            serviceData[0]['disputesData'] = disputeData;
        }
        let vendorRatingData = [];
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (serviceData[0]?.bidsData.length > 0) {
            await Promise.all(serviceData[0]?.bidsData.map(async (item) => {
                if (item.serviceProvider && item.serviceProvider._id) {
                    let reviewData = await review_model_1.default.aggregate([
                        {
                            $match: {
                                'vendor_id': item.serviceProvider._id,
                                'createdAt': { $gte: sixMonthsAgo }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                rating_overall_data: { $sum: "$rating_overall" },
                                count: { $sum: 1 },
                                createdAt: { $first: "$createdAt" }
                            }
                        },
                    ]);
                    item.serviceProvider["createdAt"] = reviewData[0]?.createdAt;
                    item.serviceProvider["rating_calculation"] = reviewData[0]?.rating_overall_data / reviewData[0]?.count;
                    // item["rating_total_count"] = reviewData[0]?.count
                    vendorRatingData.push(item);
                    return;
                }
            }));
            serviceData[0]['bidsData'] = vendorRatingData;
        }
        if (serviceData[0]._id) {
            const cancelData = await cancel_service_request_model_1.default.aggregate([
                {
                    $match: {
                        service_request_id: new mongoose_1.default.Types.ObjectId(serviceData[0]._id)
                    }
                },
                {
                    $lookup: {
                        from: 'cancel_reasons',
                        localField: 'close_reason',
                        foreignField: '_id',
                        as: 'cancelReason',
                    },
                },
                {
                    $unwind: {
                        path: "$cancelReason",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        "_id": 1,
                        "close_reason": 1,
                        "close_note": 1,
                        "createdAt": 1,
                        "cancelReason.reson": 1
                    }
                },
                { $sort: { 'createdAt': -1 } },
            ]);
            serviceData[0]['cancelRequestData'] = cancelData;
        }
        if (serviceData.length > 0) {
            const sendResponse = {
                message: 'Service Request' + process.env.APP_GET_MESSAGE,
                data: serviceData.length > 0 ? serviceData[0] : {},
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: process.env.APP_OOPS_NO_DATA_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Mark Service Requst as Complete ======================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const completed = async (req, res) => {
    const user_id = req.user._id;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { service_request_id, status, } = req.body;
        const serviceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        if (serviceReq) {
            serviceReq.status = status;
            serviceReq.updatedAt = new Date();
            await serviceReq.save();
            const BidData = await bid_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(serviceReq.selected_bid_id));
            if (serviceReq) {
                // start here Push 
                let pushTitle = "Marked as Completed";
                let message = "Request Id: " + serviceReq.request_id + " " + " is Marked as Completed";
                let payload = serviceReq;
                let userIdNotifiy = serviceReq.user_id;
                await notification_model_1.default.create({
                    user_id: userIdNotifiy,
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                });
                const userNotification = await user_model_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(userIdNotifiy)
                });
                let getTokenCustomer = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(userIdNotifiy),
                    firebase_token: { $ne: null }
                })).map(value => value.firebase_token);
                let getTokenVendor = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(BidData?.vendor_id)
                })).map(value => value.firebase_token);
                let getToken = getTokenCustomer.concat(getTokenVendor);
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
        }
        const sendResponse = {
            message: process.env.APP_MARK_COMPLETED_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_MARK_COMPLETED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Close Service Request ======================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const closeRequest = async (req, res) => {
    const user_id = req.user._id;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { service_request_id, reason, note } = req.body;
        // Check service_request_id is valid or not
        // check 1
        const ObjectId = mongoose_1.default.Types.ObjectId.isValid(service_request_id);
        if (!ObjectId) {
            throw new Error(process.env.APP_PROVIDE_VALID_OBJECT_MESSAGE);
        }
        const serviceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        let cancelReq = await new cancel_service_request_model_1.default();
        // check 2
        if (!serviceReq || !serviceReq.user_id.equals(user_id)) {
            // if (!serviceReq) {
            throw new Error(process.env.APP_SR_NOT_FOUND_MESSAGE);
        }
        if (serviceReq.is_expired) {
            throw new Error(process.env.APP_SR_EXPIRED_MESSAGE);
        }
        if (serviceReq.status == "4" || serviceReq.status == "5") {
            throw new Error(`Not able to change the status. Already marked as ${serviceReq.status}`);
        }
        if (serviceReq.status == "rewarded") {
            await bid_request_model_1.default.findByIdAndUpdate(serviceReq.selected_bid_id, {
                is_selected: 2,
            });
        }
        serviceReq.status = "9"; //4= closed
        serviceReq.close_reason = reason;
        serviceReq.close_note = note;
        serviceReq.close_sr_date = new Date();
        serviceReq.updatedAt = new Date();
        serviceReq.awarded_date = "N/A";
        await serviceReq.save();
        cancelReq.close_reason = reason;
        cancelReq.close_note = note;
        cancelReq.service_request_id = new mongoose_1.default.Types.ObjectId(service_request_id);
        await cancelReq.save();
        const sendResponse = {
            message: process.env.APP_MARK_CANCELLED_MESSAGE,
            data: Object.keys(serviceReq).length > 0 ? serviceReq : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_MARK_CANCELLED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const disputeConatctAdmin = async (req, res) => {
    const { service_request_id } = req.body;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let ServiceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        if (!ServiceReq) {
            throw new Error(process.env.APP_SR_NOT_FOUND_MESSAGE);
        }
        ServiceReq.is_admin_connect = '1';
        ServiceReq.save();
        // if (ServiceReq.status != "6") //6=disputed
        // {
        //     throw new Error(process.env.APP_SR_DISPUTE_MESSAGE);
        // }
        let filterText = {
            _id: new mongoose_1.default.Types.ObjectId(ServiceReq.dispute_id)
        };
        const adminContact = await our_contact_us_model_1.default.find({ key: 'admin_email' });
        const result = await dispute_model_1.default.aggregate([
            { $match: filterText },
            {
                $lookup: {
                    from: "categories_disputes",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDisputeData",
                },
            },
            {
                $unwind: { path: "$categoryDisputeData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 1,
                    category: 1,
                    createdAt: 1,
                    damages: 1,
                    document: 1,
                    photo: 1,
                    root_cause: 1,
                    status: 1,
                    add_response: 1,
                    update: 1,
                    action: 1,
                    "categoryDisputeData.name": 1,
                },
            },
        ]);
        try {
            // let to: any = 'abhishekg.ebiz@gmail.com';
            let to = adminContact[0].admin_email;
            let subject = process.env.APP_NAME + ' Dispute Service Request';
            let template = 'admin-contact-dispute';
            let sendEmailTemplatedata = {
                service_request_id: service_request_id,
                category: result[0].categoryDisputeData.name,
                root_cause: result[0].root_cause,
                damages: result[0].damages,
                action: result[0].action,
                photo: result[0].photo,
                status: Number(result[0].status) === 1 ? 'Pending' : 'Resolve',
                createdAt: (0, moment_1.default)(result[0].createdAt).local().format('DD/MM/YYYY h:mm A'),
                document: result[0]?.document ?? '',
                app_name: process.env.APP_NAME,
            };
            let datta = {
                to: to,
                subject: subject,
                template: template,
                sendEmailTemplatedata: sendEmailTemplatedata
            };
            await commonFunction_1.default.sendEmailTemplate(datta);
            const sendResponse = {
                message: process.env.APP_DISPUTE_CONTACT_ADMIN,
            };
            await session.commitTransaction();
            session.endSession();
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        catch (err) {
            logger.info("Contact To Admin send email");
            logger.info(err);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_DISPUTE_RISE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ======================================= Rise Dispute on on-going or completed Service Request =======================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const riseDispute = async (req, res) => {
    const user_id = req.user._id;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { service_request_id, category, root_cause, damages, action, status, photo, document } = req.body;
        const ObjectId = mongoose_1.default.Types.ObjectId.isValid(service_request_id);
        if (!ObjectId) {
            throw new Error(process.env.APP_PROVIDE_VALID_OBJECT_MESSAGE);
        }
        const serviceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        // check 2
        if (!serviceReq || !serviceReq.user_id.equals(user_id)) {
            throw new Error(process.env.APP_SR_NOT_FOUND_MESSAGE);
        }
        if (serviceReq.is_expired) {
            throw new Error(process.env.APP_SR_EXPIRED_MESSAGE);
        }
        const dispute = new dispute_model_1.default({
            service_request_id: new mongoose_1.default.Types.ObjectId(serviceReq._id),
            bid_id: new mongoose_1.default.Types.ObjectId(serviceReq.selected_bid_id),
            photo: photo,
            document: document,
            category: new mongoose_1.default.Types.ObjectId(category),
            root_cause: root_cause,
            damages: damages,
            action: action,
            status: status
        }); // status  == 1 = pending , 2 = Resolve
        await dispute.save();
        serviceReq.status = "6"; //6=disputed
        serviceReq.dispute_id = dispute._id;
        serviceReq.updatedAt = new Date();
        await serviceReq.save();
        const sendResponse = {
            message: process.env.APP_DISPUTE_RISE_MESSAGE,
            data: Object.keys(serviceReq).length > 0 ? serviceReq : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_DISPUTE_RISE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const updateDispute = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { update, id, document, photo, add_response, status } = req.body;
        const serviceReq = await service_request_model_1.default.find({ dispute_id: new mongoose_1.default.Types.ObjectId(id) });
        await dispute_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(id), {
            update: (update) ?? update,
            add_response: (add_response) ?? add_response,
            // update: update,
            status: (status) ?? status,
            document: document ?? '',
            photo: photo ?? ''
        });
        if (serviceReq[0] && status && Number(status) === 2) {
            await service_request_model_1.default.findByIdAndUpdate(serviceReq[0]._id, { status: '8', updatedAt: new Date() });
        }
        const sendResponse = {
            message: process.env.APP_DISPUTE_UPDATE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_DISPUTE_UPDATE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Rate vendor Api ======================================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const RateSP = async (req, res) => {
    const user_id = req.user._id;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { service_request_id, workmanship, materials, timeframe, behavior, rating, review, } = req.body;
        const serviceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(service_request_id));
        // check 2
        if (!serviceReq || !serviceReq.user_id.equals(user_id)) {
            throw new Error(process.env.APP_SR_NOT_FOUND_MESSAGE);
        }
        if (serviceReq.is_expired) {
            throw new Error(process.env.APP_SR_EXPIRED_MESSAGE);
        }
        let bid = {};
        if (serviceReq.selected_bid_id) {
            bid = await bid_request_model_1.default.findById(serviceReq.selected_bid_id);
            const reviewExist = await review_model_1.default.findOne({ bid_id: bid._id });
            if (reviewExist) {
                const sendResponse = {
                    message: process.env.APP_REVIEW_RAtING_ALREDY_MESSAGE,
                    data: Object.keys(reviewExist).length > 0 ? reviewExist : {},
                };
                await session.commitTransaction();
                session.endSession();
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
        }
        serviceReq.is_review_by_sp = true;
        serviceReq.save();
        const ReviewData = new review_model_1.default();
        ReviewData.user_id = user_id;
        ReviewData.vendor_id = bid?.vendor_id;
        ReviewData.bid_id = bid?._id;
        ReviewData.rating_workmanship = workmanship;
        ReviewData.rating_materials = materials;
        ReviewData.rating_timeframe = timeframe;
        ReviewData.rating_behavior = behavior;
        ReviewData.rating_overall = rating;
        ReviewData.review = review;
        await ReviewData.save();
        const sendResponse = {
            message: process.env.APP_REVIEW_SP_MESSAGE,
            data: Object.keys(ReviewData).length > 0 ? ReviewData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_REVIEW_SP_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Compleshment Report on Service Request if any =====================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getComplishmentReport = async (req, res) => {
    const customer = req.user;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.query;
        let result = await accomplishment_report_model_1.default.findById(new mongoose_1.default.Types.ObjectId(id));
        if (!result) {
            throw new Error(process.env.APP_COMPLESHMENT_REPORT_NOT_MESSAGE);
        }
        if (!result.user_id === customer._id) {
            throw new Error(process.env.APP_COMPLESHMENT_REPORT_NOT_MESSAGE);
        }
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: (result).length > 0 ? result : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Complishment Report" + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Dispute Detail on Service Request if any =====================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getDisputeDetails = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.query;
        let ServiceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(id));
        if (!ServiceReq) {
            throw new Error(process.env.APP_SR_NOT_FOUND_MESSAGE);
        }
        if (ServiceReq.status != "6") //6=disputed
         {
            throw new Error(process.env.APP_SR_DISPUTE_MESSAGE);
        }
        let filterText = {
            _id: new mongoose_1.default.Types.ObjectId(ServiceReq.dispute_id)
        };
        const result = await dispute_model_1.default.aggregate([
            { $match: filterText },
            {
                $lookup: {
                    from: "categories_disputes",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDisputeData",
                },
            },
            {
                $unwind: { path: "$categoryDisputeData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 1,
                    category: 1,
                    createdAt: 1,
                    damages: 1,
                    document: 1,
                    photo: 1,
                    root_cause: 1,
                    status: 1,
                    add_response: 1,
                    update: 1,
                    action: 1,
                    "categoryDisputeData.name": 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: result.length > 0 ? result[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeAccomplishementReport = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { service_request_id, 
        // vendor_id,
        user_id, completion_date, note, issue, customer_note, photo, document } = req.body;
        let vendor_id = req.user._id;
        let accomplishmentReportData = await new accomplishment_report_model_2.default();
        let message = 'Accomplishment Report' + process.env.APP_STORE_MESSAGE;
        accomplishmentReportData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
        accomplishmentReportData.service_request_id = new mongoose_1.default.Types.ObjectId(service_request_id);
        accomplishmentReportData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        accomplishmentReportData.completion_date = completion_date;
        accomplishmentReportData.note = note;
        accomplishmentReportData.issue = issue;
        accomplishmentReportData.customer_note = customer_note;
        accomplishmentReportData.photo = photo ?? '';
        accomplishmentReportData.document = document ?? '';
        await accomplishmentReportData.save();
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
        logger.info('Accomplishment Report' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    store,
    get,
    completed,
    getReport,
    getBySlug,
    closeRequest,
    riseDispute,
    updateDispute,
    RateSP,
    getComplishmentReport,
    getDisputeDetails,
    storeAccomplishementReport,
    edit,
    disputeConatctAdmin
};
