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
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const service_request_image_model_1 = __importDefault(require("../../models/service-request-image-model"));
const dispute_model_1 = __importDefault(require("../../models/dispute-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "customerData.first_name",
    "customerData.last_name",
    "customerData.profile_photo",
    "serviceRequestDocumentData.type",
    "serviceRequestDocumentData.path",
    "serviceRequestImagesData.type",
    "serviceRequestImagesData.path",
    "serviceTypeData._id",
    "serviceTypeData.name",
    "assetsData.name",
    "assetsData.type",
    "assetsData.url",
    "priorityData.name",
    "srBidsData._id",
    "srBidsData.amount",
    "srBidsData.workingSPData._id",
    "srBidsData.workingSPData.first_name",
    "srBidsData.workingSPData.last_name",
    "srBidsData.workingSPData.user_name",
    "srBidsData.workingSPData.profile_photo",
    "_id",
    "selected_bid_id",
    "user_id",
    "service_type_id",
    "assets_id",
    "dispute_id",
    "bid_id",
    "is_admin_connect",
    "admin_comment",
    "complishment_report",
    "title",
    "location",
    "detail",
    "contact_no",
    "priority",
    "schedule_date",
    "type",
    "request_id",
    "close_reason",
    "close_note",
    "is_deleted",
    "is_exipred",
    "selected_vendor",
    "bid_price",
    "complishment_report_date",
    "status",
    "is_active",
    "createdAt",
    "updatedAt",
    "slug"
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const get = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText = {};
        let filterTextValue = search;
        let assets_id = req.query.assets_id;
        let priority = req.query.priority;
        let service_type_id = req.query.service_type_id;
        let status = req.query.status;
        const select_user_id = (req.query.user_id) ?? req.query.user_id;
        let orders = {};
        let filterTextId = {};
        let pageFind = page ? Number(page) - 1 : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        if (select_user_id && select_user_id !== 'undefined' || select_user_id !== undefined) {
            filterText = {
                user_id: new mongoose_1.default.Types.ObjectId(select_user_id)
            };
        }
        if (assets_id && service_type_id) {
            filterTextId = {
                ...filterTextId,
                $and: [{ assets_id: { $in: [new mongoose_1.default.Types.ObjectId(assets_id)] } },
                    { service_type_id: { $in: [new mongoose_1.default.Types.ObjectId(service_type_id)] } }]
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
        if (status) {
            filterText = {
                ...filterText,
                $or: [{ status: { $in: [status] } }]
            };
        }
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
            // if (mongoose.Types.ObjectId.isValid(filterTextValue)) {
            //     filterText = {
            //         $or: [
            //             { _id: new mongoose.Types.ObjectId(filterTextValue) },
            //         ],
            //     }
            // }
        }
        const serviceData = await service_request_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'customerData'
                }
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
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
            {
                $lookup: {
                    from: 'service_types',
                    localField: 'service_type_id',
                    foreignField: '_id',
                    as: 'serviceTypeData'
                }
            },
            { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'assets',
                    localField: 'assets_id',
                    foreignField: '_id',
                    as: 'assetsData'
                }
            },
            { $unwind: { path: "$assetsData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "priorities",
                    localField: "priority",
                    foreignField: "_id",
                    as: "priorityData",
                },
            },
            {
                $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "bids",
                    localField: "selected_bid_id",
                    foreignField: "_id",
                    as: "srBidsData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "workingSPData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$workingSPData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "_id": { $toString: "$_id" }
                }
            },
            {
                $project: {
                    ...project,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    updatedAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$updatedAt" },
                    }
                },
            },
            { $match: filterText },
            { $match: filterTextId },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: "createdAt" }],
                    docs: [{ $addFields: { _id: "$_id" } }],
                },
            },
            { $unwind: "$total" },
            {
                $project: {
                    docs: {
                        $slice: [
                            "$docs",
                            perPage * pageFind,
                            {
                                $ifNull: [perPage, "$total.createdAt"],
                            },
                        ],
                    },
                    total: "$total.createdAt",
                    limit: { $literal: perPage },
                    page: { $literal: pageFind + 1 },
                    pages: { $ceil: { $divide: ["$total.createdAt", perPage] } },
                },
            },
        ]);
        const sendResponse = {
            message: 'Service Request' + process.env.APP_GET_MESSAGE,
            data: serviceData.length > 0 ? serviceData[0] : {},
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
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************
const destroy = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await service_request_model_1.default.deleteMany({ _id: req.query.id });
        const responseData = {
            message: 'Service Request' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Service Request' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// =================================== Edit the Record Data ==================================
// *******************************************************************************************
const getData = async (id) => {
    const serviceData = await service_request_model_1.default.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'customerData'
            }
        },
        { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
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
        {
            $lookup: {
                from: 'service_types',
                localField: 'service_type_id',
                foreignField: '_id',
                as: 'serviceTypeData'
            }
        },
        { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'assets',
                localField: 'assets_id',
                foreignField: '_id',
                as: 'assetsData'
            }
        },
        { $unwind: { path: "$assetsData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "bids",
                localField: "selected_bid_id",
                foreignField: "_id",
                as: "srBidsData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "workingSPData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$workingSPData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },
        { $project: project },
        {
            $project: {},
        },
    ]);
    return serviceData.length > 0 ? serviceData[0] : {};
};
const edit = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Service Request' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('Service Request' + process.env.APP_EDIT_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ================================= Change Status of Record =================================
// *******************************************************************************************
const changeStatus = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const serviceData = await service_request_model_1.default.findOne({ _id: id });
        serviceData.is_active = status;
        await serviceData.save();
        const message = `Service Request status ${status === "true" ? "Approved" : "Rejected"} successfully`;
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
};
const closeByAdmin = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const serviceData = await service_request_model_1.default.findOne({ _id: id });
        serviceData.status = 10;
        serviceData.admin_comment = req.body.admin_comment;
        if (serviceData.dispute_id) {
            await dispute_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(serviceData.dispute_id), {
                status: 2
            });
        }
        await serviceData.save();
        const message = `Service Request Closed successfully`;
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
};
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const { user_id, service_type_id, asset_id, title, location, type, detail, photos, document, contact_no, priority, schedule_date, } = req.body;
        let serviceData = {};
        let message;
        if (id) {
            serviceData = await service_request_model_1.default.findOne({ _id: id });
            message = 'Service Request' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            serviceData = await new service_request_model_1.default();
            message = 'Service Request' + process.env.APP_STORE_MESSAGE;
        }
        serviceData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        serviceData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        serviceData.assets_id = new mongoose_1.default.Types.ObjectId(asset_id);
        serviceData.title = title;
        serviceData.location = location;
        serviceData.detail = detail;
        serviceData.contact_no = contact_no;
        serviceData.priority = new mongoose_1.default.Types.ObjectId(priority);
        serviceData.type = type;
        serviceData.status = 2;
        serviceData.slug = await commonFunction_1.default.titleToSlug(title);
        serviceData.request_id = await commonFunction_1.default.makeIdString(15);
        ;
        serviceData.schedule_date = (Number(type) === 2) ? schedule_date : '';
        await serviceData.save();
        if (photos) {
            photos.map(async function (img) {
                const imageData = new service_request_image_model_1.default();
                imageData.service_request_id = serviceData._id;
                imageData.path = img;
                imageData.type = 1; // image
                await imageData.save();
            });
        }
        if (document) {
            const imageData = new service_request_image_model_1.default();
            imageData.service_request_id = serviceData._id;
            imageData.path = document;
            imageData.type = 2; // document
            await imageData.save();
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(serviceData._id),
        };
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
// Export default
exports.default = {
    get,
    store,
    changeStatus,
    edit,
    destroy,
    closeByAdmin,
};
