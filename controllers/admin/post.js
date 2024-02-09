"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const post_model_1 = __importDefault(require("../../models/post-model"));
const post_comment_model_1 = __importDefault(require("../../models/post-comment-model"));
const post_image_model_1 = __importDefault(require("../../models/post-image-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiledComment = [
    "_id",
    "admin_id",
    "vendor_id",
    "user_id",
    "post_id",
    "type",
    "comment",
    "customerData.first_name",
    "adminData.first_name",
    "vendorData.first_name",
    "customerData.last_name",
    "adminData.last_name",
    "vendorData.last_name",
    "customerData.profile_photo",
    "adminData.profile_photo",
    "vendorData.profile_photo",
    "createdAt",
];
let projectComment = {};
const getAllFiledComment = async () => {
    await allFiledComment.map(function async(item) {
        projectComment[item] = 1;
    });
};
getAllFiledComment();
const allFiled = [
    "_id",
    // "date_time",
    "admin_id",
    "vendor_id",
    "user_id",
    "type",
    // "title",
    // "slug",
    // "short_description",
    "description",
    // "service_provider_name",
    "is_active",
    "postImageData",
    "createdAt",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const getComment = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterTextValue = search;
        let post_ids = req.query.post_id;
        let orders = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let filterText = {};
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        if (filterTextValue) {
            let filterTextField = [];
            await projectComment.map(function async(filed) {
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
        const postData = await post_comment_model_1.default.aggregate([
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
                    from: 'users',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendorData'
                }
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'admin_id',
                    foreignField: '_id',
                    as: 'adminData'
                }
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $project: projectComment },
            {
                $match: {
                    $and: [
                        { post_id: new mongoose_1.default.Types.ObjectId(post_ids) },
                        filterText
                    ]
                }
            },
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
            message: 'Post' + process.env.APP_GET_MESSAGE,
            data: postData.length > 0 ? postData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Post' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
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
        const postData = await post_model_1.default.aggregate([
            { $project: project },
            {
                $lookup: {
                    from: 'post_images',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'postImageData'
                }
            },
            // { $unwind: { path: "$postImageData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendorData'
                }
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'admin_id',
                    foreignField: '_id',
                    as: 'adminData'
                }
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
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
            message: 'Post' + process.env.APP_GET_MESSAGE,
            data: postData.length > 0 ? postData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Post' + process.env.APP_GET_MESSAGE);
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
        const postData = await post_model_1.default.findOne({ _id: req.query.id });
        await post_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Post' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        if (postData) {
            // start here Push 
            let pushTitle = 'Post record has been deleted Successfully';
            let message = postData.title + 'has been deleted Successfully';
            let payload = postData;
            let userIdNotifiy = postData.vendor_id;
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
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Post' + process.env.APP_DELETE_MESSAGE);
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
    const postData = await post_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'post_images',
                localField: '_id',
                foreignField: 'post_id',
                as: 'postImageData'
            }
        },
        { $project: project },
    ]);
    return postData.length > 0 ? postData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Post' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('Post' + process.env.APP_EDIT_GET_MESSAGE);
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
        let id = req.body.id;
        let status = req.body.status;
        const postData = await post_model_1.default.findOne({ _id: id });
        postData.is_active = status;
        await postData.save();
        const message = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
        const responseData = {
            message: message,
            data: true,
        };
        if (postData) {
            // start here Push 
            let pushTitle = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
            let message = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
            let payload = postData;
            let userIdNotifiy = postData.vendor_id;
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
        const { images, 
        // service_provider_name,
        // date_time,
        description, 
        // short_description,
        // title,
        type, admin_id, vendor_id, user_id, } = req.body;
        let postData = {};
        let message;
        if (id) {
            postData = await post_model_1.default.findOne({ _id: id });
            message = 'Post' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            postData = await new post_model_1.default();
            message = 'Post' + process.env.APP_STORE_MESSAGE;
        }
        // postData.image = image;
        // postData.service_provider_name = service_provider_name;
        // postData.date_time = date_time;
        postData.description = description;
        // postData.short_description = short_description;
        // postData.title = title;
        // postData.slug = await CommonFunction.titleToSlug(title);
        postData.type = type;
        if (Number(type) === 1 && admin_id) {
            postData.admin_id = new mongoose_1.default.Types.ObjectId(admin_id);
        }
        if (Number(type) === 2 && vendor_id) {
            postData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
        }
        if (Number(type) === 3 && user_id) {
            postData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        }
        await postData.save();
        if (images) {
            await post_image_model_1.default.deleteMany({ post_id: new mongoose_1.default.Types.ObjectId(id), });
            images.map(async (img, i) => {
                let postImageData = await new post_image_model_1.default();
                postImageData.post_id = new mongoose_1.default.Types.ObjectId(postData._id);
                postImageData.image = images[i];
                await postImageData.save();
            });
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(postData._id),
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Post' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const deletePostComment = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await post_comment_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Comment Post' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Comment Post' + process.env.APP_DELETE_MESSAGE);
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
    getComment,
    destroy,
    deletePostComment,
};
