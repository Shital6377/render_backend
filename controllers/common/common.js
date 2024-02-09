"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const fs_1 = __importDefault(require("fs"));
const aws_1 = __importDefault(require("../../helper/aws"));
const jwt_1 = __importDefault(require("../../helper/jwt"));
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = __importDefault(require("../../models/category-model"));
const contactus_model_1 = __importDefault(require("../../models/contactus-model"));
const admin_model_1 = __importDefault(require("../../models/admin-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const chat_model_1 = __importDefault(require("../../models/chat-model"));
const post_model_1 = __importDefault(require("../../models/post-model"));
const post_like_model_1 = __importDefault(require("../../models/post-like-model"));
const post_comment_model_1 = __importDefault(require("../../models/post-comment-model"));
const sizeImage_1 = require("../../helper/sizeImage");
const cms_model_1 = __importDefault(require("../../models/cms-model"));
const faq_model_1 = __importDefault(require("../../models/faq-model"));
const service_type_model_1 = __importDefault(require("../../models/service-type-model"));
const asset_model_1 = __importDefault(require("../../models/asset-model"));
const cancel_reason_model_1 = __importDefault(require("../../models/cancel-reason-model"));
const categories_dispute_model_1 = __importDefault(require("../../models/categories-dispute-model"));
const assets_category_model_1 = __importDefault(require("../../models/assets-category-model"));
const assets_uses_model_1 = __importDefault(require("../../models/assets-uses-model"));
const assets_structure_type_model_1 = __importDefault(require("../../models/assets-structure-type-model"));
const assets_facade_type_model_1 = __importDefault(require("../../models/assets-facade-type-model"));
const post_image_model_1 = __importDefault(require("../../models/post-image-model"));
const social_media_model_1 = __importDefault(require("../../models/social-media-model"));
const suggestions_model_1 = __importDefault(require("../../models/suggestions-model"));
const priority_model_1 = __importDefault(require("../../models/priority-model"));
const our_contact_us_model_1 = __importDefault(require("../../models/our-contact-us-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const admin_token_model_1 = __importDefault(require("../../models/admin-token-model"));
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const dispute_model_1 = __importDefault(require("../../models/dispute-model"));
const commonFunction_2 = __importDefault(require("../../helper/commonFunction"));
const why_maintenance_model_1 = __importDefault(require("../../models/why-maintenance-model"));
const post_like_model_2 = __importDefault(require("../../models/post-like-model"));
const log4js = require("log4js");
const logger = log4js.getLogger();
const otpVerification = async (req, res) => {
    try {
        const { otp, token } = req.body;
        if (!token) {
            const sendResponse = {
                message: process.env.APP_TOKEN_INVALID,
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        const getOtp = await otp_model_1.default.findOne({
            // user_id: new mongoose.Types.ObjectId(clientData.user_id),
            token: token,
        });
        const matchOtp = getOtp.otp == otp;
        if (!matchOtp) {
            const sendResponse = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
                data: {},
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const expired = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
                data: {},
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const passwordResetToken = await jwt_1.default.sign({
            otp: otp,
            user_id: clientData.user_id,
            mobile_no: clientData.mobile_no,
        });
        await otp_model_1.default.findByIdAndDelete(getOtp._id);
        const sendResponse = {
            token: passwordResetToken,
            message: process.env.APP_OTP_VERIFY,
            data: {}
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: process.env.APP_OTP_EXPIREd,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadFiles = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const blob = fs_1.default.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "file/" + Date.now() + originalFile;
            const uploadedImageData = await aws_1.default.uploadFileToS3(imageName, blob);
            fs_1.default.unlinkSync(req.files[0].path);
            const responseData = {
                data: {
                    url: uploadedImageData.Location,
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadVideo = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const type = req.query.type;
        const blob = fs_1.default.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "admin/" + Date.now() + originalFile;
            if (Number(type) === 11) {
                imageName = "chat/video/" + Date.now() + originalFile;
            }
            if (Number(type) === 12) {
                imageName = "chat/audio/" + Date.now() + originalFile;
            }
            const uploadedImageData = await aws_1.default.uploadFileToS3(imageName, blob);
            fs_1.default.unlinkSync(req.files[0].path);
            const responseData = {
                data: {
                    image_url: uploadedImageData.Location,
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadImage = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const blob = fs_1.default.readFileSync(imagePath);
        if (imagePath && blob) {
            if (req.files[0]) {
                req.files[0].path = 'http://103.154.184.187:5006/' + req.files[0].path;
            }
            const responseData = {
                data: {
                    image_url: "http://103.154.184.187:5006/" + imagePath
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadImageMulti = async (req, res) => {
    try {
        let imgData = [];
        req.files.map(async (val, i) => {
            const imagePath = req.files[i].path;
            const type = req.query.type;
            const blob = fs_1.default.readFileSync(imagePath);
            const originalFile = req.files[i].originalname;
            if (imagePath && blob) {
                let imageName = "admin/" + Date.now() + originalFile;
                if (Number(type) === 1) {
                    imageName = "admin/" + Date.now() + originalFile;
                }
                if (Number(type) === 2) {
                    imageName = "chat/" + Date.now() + originalFile;
                }
                if (Number(type) === 3) {
                    imageName = "customer/" + Date.now() + originalFile;
                }
                if (Number(type) === 4) {
                    imageName = "vendor/" + Date.now() + originalFile;
                }
                if (Number(type) === 5) {
                    imageName = "contact_us/" + Date.now() + originalFile;
                }
                if (Number(type) === 6) {
                    imageName = "service_request/" + Date.now() + originalFile;
                }
                if (Number(type) === 7) {
                    imageName = "bid_signature/" + Date.now() + originalFile;
                }
                if (Number(type) === 8) {
                    imageName = "our_services/" + Date.now() + originalFile;
                }
                if (Number(type) === 9) {
                    imageName = "social_icon/" + Date.now() + originalFile;
                }
                if (Number(type) === 13) {
                    imageName = "why_maintenance_master/" + Date.now() + originalFile;
                }
                // const uploadedImageData: any = await aws.uploadImageToS3(imageName, blob);
                // let comparessedImageData: any = await reSizeImage(blob, 400, 400);
                // if (Number(type) === 7 || Number(type) === 2) {
                let comparessedImageData = await (0, sizeImage_1.nonReSizeImage)(blob);
                // }
                const uploadedImageData = await aws_1.default.uploadImageToS3(imageName, comparessedImageData);
                imgData.push(uploadedImageData.Location);
                fs_1.default.unlinkSync(req.files[i].path);
            }
            if (imgData.length === req.files.length) {
                const responseData = {
                    data: imgData,
                    message: process.env.APP_UPLOAD_FILE_MESSAGE
                };
                return responseMiddleware_1.default.sendResponse(res, responseData);
            }
        });
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCategory = async (req, res) => {
    try {
        const categoryData = await category_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    parent_id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: 'Category' + process.env.APP_GET_MESSAGE,
            data: categoryData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Category' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveAdmin = async (req, res) => {
    try {
        const adminData = await admin_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: 'Active Admin' + process.env.APP_GET_MESSAGE,
            data: adminData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Active Admin' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveVendor = async (req, res) => {
    try {
        const vendorData = await user_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: 'SR Active' + process.env.APP_GET_MESSAGE,
            data: vendorData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('SR Active' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveCustomer = async (req, res) => {
    try {
        const customerData = await user_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: 'Customer Active' + process.env.APP_GET_MESSAGE,
            data: customerData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Customer Active' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getServiceType = async (req, res) => {
    try {
        const serviceTypeData = await service_type_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    name: 1,
                },
            },
            { $sort: { 'name': 1 } },
        ]);
        const sendResponse = {
            message: 'Service Type' + process.env.APP_GET_MESSAGE,
            data: serviceTypeData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Service Type' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getAssets = async (req, res) => {
    try {
        const assetsData = await asset_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
            { $sort: { 'name': 1 } },
        ]);
        const sendResponse = {
            message: 'Asset' + process.env.APP_GET_MESSAGE,
            data: assetsData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Asset' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const getChat = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type, search } = req.body;
        let filterText = {};
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (search) {
            filterText = {
                ...filterText,
                $or: [
                    { "customerData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "customerData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.last_name": { $regex: `${search}`, $options: "i" } },
                ],
            };
        }
        const ChatStatus = await chat_model_1.default.aggregate([
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
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    room_id: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_CHAt_JOINED_MESSAGE,
            data: ChatStatus,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeContactUs = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { email, name, mobile_no, message, user_id, images, location, subject } = req.body;
        let contactUsData = await new contactus_model_1.default();
        contactUsData.email = email;
        contactUsData.name = name;
        contactUsData.mobile_no = mobile_no;
        contactUsData.location = location;
        contactUsData.subject = subject;
        contactUsData.message = message;
        if (user_id) {
            contactUsData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        }
        contactUsData.images = JSON.stringify(images);
        await contactUsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_THANK_YOU_MESSAGE,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_THANK_YOU_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeChat = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type } = req.body;
        let filterText = {};
        // type
        // 1 admin and vendor chat
        // 2 admin and customer chat
        // 3 customer and customer chat
        // 4 customer and vendor chat
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 4) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const chatFindData = await chat_model_1.default.findOne(filterText).count();
        if (chatFindData <= 0) {
            const storeChatData = await new chat_model_1.default();
            if (admin_id) {
                storeChatData.admin_id = new mongoose_1.default.Types.ObjectId(admin_id);
            }
            if (user_id) {
                storeChatData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
            }
            if (vendor_id) {
                storeChatData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
            }
            storeChatData.type = type;
            storeChatData.room_id = await commonFunction_1.default.makeIdString(15);
            await storeChatData.save();
        }
        const chatData = await chat_model_1.default.findOne(filterText);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_CHAt_JOINED_MESSAGE,
            data: chatData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_CHAt_JOINED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storePostComment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, user_id, type, comment, post_id, page, per_page } = req.body;
        let userData = {};
        userData = {
            type: type,
            comment: comment,
            post_id: new mongoose_1.default.Types.ObjectId(post_id),
        };
        if (Number(type) === 1) {
            userData = {
                ...userData,
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            userData = {
                ...userData,
                vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 3) {
            userData = {
                ...userData,
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const postLikeData = await post_comment_model_1.default.create(userData);
        const postData = await post_model_1.default.findOne({ _id: post_id });
        if (postLikeData) {
            // start here Push 
            let pushTitle = process.env.APP_COMMENT_MESSAGE;
            let message = postData._id + process.env.APP_COMMENT_MESSAGE;
            let payload = postLikeData;
            let userIdNotifiy = Number(type) === 1 ? admin_id : Number(type) === 2 ? user_id : Number(type) === 3 ? user_id : '';
            console.log('userIdNotifiy', userIdNotifiy);
            console.log('pushTitle', pushTitle);
            console.log('message', message);
            await notification_model_1.default.create({
                user_id: new mongoose_1.default.Types.ObjectId(userIdNotifiy),
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            });
            const userNotification = await user_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(userIdNotifiy)
            });
            let getTokens = (await user_token_model_1.default.find({
                user_id: new mongoose_1.default.Types.ObjectId(userIdNotifiy)
            }));
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
                    console.log('yrrrrr', token);
                    await firebase_1.default.sendPushNotification(token, fcmData);
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }
        const getComments = await getCommentData({ post_id: post_id, per_page: per_page, page: page });
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_COMMENT_ADD_MESSAGE,
            // commentsData: getComments,
            data: getComments
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_CHAt_JOINED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCommentData = async (props) => {
    const { post_id, per_page, page } = props;
    let perPage = per_page == undefined ? 10 : Number(per_page);
    let skipPage = (page && page > 0) ? (Number(Number(page)) * Number(perPage)) : 0;
    const postCommentData = await post_comment_model_1.default.aggregate([
        {
            $match: {
                post_id: new mongoose_1.default.Types.ObjectId(post_id),
                is_active: true
            },
        },
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
                from: "admins",
                localField: "admin_id",
                foreignField: "_id",
                as: "adminData",
            },
        },
        { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                admin_id: 1,
                vendor_id: 1,
                user_id: 1,
                type: 1,
                comment: 1,
                "customerData.first_name": 1,
                "adminData.first_name": 1,
                "vendorData.first_name": 1,
                "vendorData.user_name": 1,
                "customerData.last_name": 1,
                "adminData.last_name": 1,
                "adminData.user_name": 1,
                "vendorData.last_name": 1,
                "customerData.profile_photo": 1,
                "customerData.user_name": 1,
                "adminData.profile_photo": 1,
                "vendorData.profile_photo": 1,
                createdAt: 1,
            },
        },
        { $sort: { 'createdAt': -1 } },
        { $skip: parseInt(skipPage) },
        { $limit: perPage },
    ]);
    return postCommentData;
};
const storePostLike = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type, post_id } = req.body;
        let userData = {};
        let userName = '';
        userData = {
            type: type,
            post_id: new mongoose_1.default.Types.ObjectId(post_id),
        };
        if (Number(type) === 1 && admin_id) {
            userData = {
                ...userData,
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2 && vendor_id) {
            userData = {
                ...userData,
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3 && user_id) {
            userData = {
                ...userData,
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        let message = "";
        const postLikeData = await post_like_model_1.default.findOne(userData);
        if (postLikeData) {
            await postLikeData.delete();
            message = process.env.APP_POST_UNLIKE;
        }
        else {
            await post_like_model_1.default.create(userData);
            message = process.env.APP_POST_LIKE;
        }
        if (!postLikeData && Number(type) === 1) {
            const adminData = await admin_model_1.default.findById(admin_id);
            userName = adminData?.first_name + ' ' + adminData?.last_name;
        }
        else if (!postLikeData && Number(type) === 2 || Number(type) === 3) {
            const user = Number(type) === 2 ? vendor_id : user_id;
            const userData = await user_model_1.default.findById(user);
            userName = userData?.first_name + ' ' + userData?.last_name;
        }
        const postData = await post_model_1.default.findOne({ _id: post_id });
        if (postData && !postLikeData) {
            // start here Push 
            let pushTitle = "Your" + process.env.APP_POST_LIKE;
            let message = userName + " " + "like your Post";
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
        const totalLikePost = await post_like_model_2.default.count({ post_id: new mongoose_1.default.Types.ObjectId(post_id) });
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: { count: totalLikePost },
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getPostComment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { post_id, page, per_page } = req.body;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page)) * Number(perPage)) : 0;
        const postCommentData = await post_comment_model_1.default.aggregate([
            {
                $match: {
                    post_id: new mongoose_1.default.Types.ObjectId(post_id),
                    is_active: true
                },
            },
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
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    comment: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "vendorData.user_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "adminData.user_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "customerData.user_name": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    createdAt: 1,
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: perPage },
        ]);
        const count = await post_comment_model_1.default.count({
            post_id: new mongoose_1.default.Types.ObjectId(post_id),
            is_active: true
        });
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_POST_COMMENT,
            data: { data: postCommentData, total: count },
            total: count,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Post Comment");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getPostDetail = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.body;
        const postData = await post_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(id),
                }
            },
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
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    pipeline: [
                        // {
                        //     $match: filterText
                        // },
                        {
                            $project: {
                                is_like: "1",
                            },
                        },
                    ],
                    as: "postLikes",
                },
            },
            { $unwind: { path: "$postLikes", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    is_like: { $ifNull: ["$postLikes.is_like", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },
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
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    is_like: 1,
                    "postLikes._id": 1,
                    "postLikes.is_like": 1,
                    postImageData: 1,
                    "postTotalLike": 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData[0],
            }
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getPost = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, type, user_id, search, page } = req.body;
        let skipPage = (page && page > 0) ? (Number(Number(page)) * Number(req.body.per_page)) : 0;
        // const user_id:any =req.query.id;
        let filterText = { is_active: true };
        if (Number(type) === 1 && admin_id) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2 && vendor_id) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        // if (!vendor_id || !admin_id) {
        //     filterText = { is_active: true }
        // }
        // if (Number(type) === 3) {
        //     filterText = {
        //         user_id: new mongoose.Types.ObjectId(user_id),
        //     };
        // }
        let countData = await post_model_1.default.count(filterText);
        const postData = await post_model_1.default.aggregate([
            { $sort: { 'createdAt': -1 } },
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            // { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            // { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            // { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            // {
            //     $lookup: {
            //         from: "post_likes",
            //         localField: "_id",
            //         foreignField: "post_id",
            //         pipeline: [
            //             {
            //                 $match: filterText
            //             },
            //             {
            //                 $project: {
            //                     is_like: "1",
            //                 },
            //             },
            //         ],
            //         as: "postLikes",
            //     },
            // },
            // { $unwind: { path: "$postLikes", preserveNullAndEmptyArrays: true } },
            // {
            //     $addFields: {
            //         is_like: { $ifNull: ["$postLikes.is_like", "0"] },
            //     },
            // },
            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },
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
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalComment",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },
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
            { $unwind: { path: "$postTotalComment", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalComment.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postComments",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $limit: parseInt("2") },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "commentCustomerData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentCustomerData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "commentVendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentVendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "admins",
                                localField: "admin_id",
                                foreignField: "_id",
                                as: "commentAdminData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentAdminData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            // { $unwind: { path: "$postComments", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    // title: 1,
                    // slug: 1,
                    // short_description: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    // is_like: 1,
                    // "postLikes._id": 1,
                    // "postLikes.is_like": 1,
                    "postComments._id": 1,
                    "postComments.admin_id": 1,
                    "postComments.vendor_id": 1,
                    "postComments.user_id": 1,
                    "postComments.type": 1,
                    "postComments.comment": 1,
                    "postComments.commentCustomerData.first_name": 1,
                    "postComments.commentCustomerData.profile_photo": 1,
                    "postComments.commentCustomerData.last_name": 1,
                    "postComments.commentAdminData.first_name": 1,
                    "postComments.commentAdminData.last_name": 1,
                    "postComments.commentAdminData.profile_photo": 1,
                    "postComments.commentVendorData.first_name": 1,
                    "postComments.commentVendorData.last_name": 1,
                    "postComments.commentVendorData.profile_photo": 1,
                    postImageData: 1,
                    "postTotalLike": 1,
                    "postTotalComment": 1,
                },
            },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(req.body.per_page) },
            // { $sort: { 'createdAt': -1 } },
        ]);
        let filterTextLike = { is_active: true };
        if (admin_id && admin_id !== null) {
            filterTextLike = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (vendor_id && vendor_id !== null) {
            filterTextLike = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (user_id && user_id !== null) {
            filterTextLike = {
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const checkisLogin = admin_id || user_id || vendor_id;
        let getpostData = [];
        if (postData.length > 0) {
            await Promise.all(postData.map(async (item) => {
                if (item._id) {
                    let postLikeData = await post_like_model_1.default.aggregate([
                        {
                            $match: filterTextLike
                        },
                        {
                            $match: { "post_id": new mongoose_1.default.Types.ObjectId(item._id) }
                        },
                        {
                            $project: {
                                _id: 1,
                                post_id: 1,
                                vendor_id: 1
                            }
                        }
                    ]);
                    if (checkisLogin && checkisLogin !== null && checkisLogin !== '') {
                        item["is_like"] = postLikeData[0]?._id ? 1 : 0;
                    }
                    else {
                        item["is_like"] = 0;
                    }
                    getpostData.push(item);
                    return;
                }
            }));
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData.length > 0 ? postData : [],
                total: countData,
            }
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCheckIsLikePost = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { post_id, type, user_id } = req.query;
        let userData = {};
        userData = {
            type: type,
            post_id: new mongoose_1.default.Types.ObjectId(post_id),
        };
        if (Number(type) === 2) {
            userData = {
                ...userData,
                vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 3) {
            userData = {
                ...userData,
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const postLikeData = await post_like_model_1.default.findOne(userData);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_POST_LIKE,
            data: postLikeData ? 1 : 0,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("like get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storePost = (async (req, res) => {
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
        type, vendor_id, } = req.body;
        let postData = {};
        let message;
        if (id) {
            postData = await post_model_1.default.findOne({ _id: id });
            message = process.env.APP_POST_UPDATED;
        }
        else {
            postData = await new post_model_1.default();
            message = process.env.APP_POST_ADDED;
        }
        // postData.image = image;
        // postData.service_provider_name = service_provider_name;
        // postData.date_time = date_time;
        postData.description = description;
        // postData.short_description = short_description;
        // postData.title = title;
        // postData.slug = await CommonFunction.titleToSlug(title);
        postData.type = type;
        postData.is_active = false;
        if (Number(type) === 2 && vendor_id) {
            postData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
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
        if (postData) {
            // start here Push 
            let pushTitle = process.env.APP_STORY_UPLOADED;
            let message = process.env.APP_STORY_UPLOADED;
            let payload = postData;
            let userIdNotifiy = vendor_id;
            await notification_model_1.default.create({
                user_id: new mongoose_1.default.Types.ObjectId(userIdNotifiy),
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
        if (postData) {
            // start here Push 
            let pushTitle = process.env.APP_NEW_STORY_AVAILABLE;
            let message = description.substring(0, 20);
            let payload = postData;
            let userIdNotifiy = vendor_id;
            let getToken = (await admin_token_model_1.default.find()).map(value => value.firebase_token);
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
        logger.info("store Post Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const getRecentPost = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const postData = await post_model_1.default.aggregate([
            commonFunction_2.default.isActive(),
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    title: 1,
                    slug: 1,
                    short_description: 1,
                    description: 1,
                    image: 1,
                    service_provider_name: 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    postImageData: 1,
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $limit: parseInt("10") },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: postData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// function replaceMulti(haystack: any, needle: any, replacement: any) {
//     return haystack.split(needle).join(replacement);
// }
const getCms = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // let slug: any = req.query.slug || "";
        // slug = slug.replace(
        //     /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|/gi,
        //     ""
        // );
        // slug = replaceMulti(slug, '-', '_')
        // const cmsData: any = await Cms.aggregate([{ $match: { key: slug } }]);
        const cmsData = await cms_model_1.default.find({});
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: 'Cms' + ' ' + process.env.APP_GET_MESSAGE,
            data: cmsData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getPriority = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const priorityData = await priority_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    is_active: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_PRIORITY_GET,
            data: priorityData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getFaq = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const faqData = await faq_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    is_active: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_FAQ_GET,
            data: faqData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCancelReason = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const resonData = await cancel_reason_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    reson: 1,
                    is_active: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_FAQ_GET,
            data: resonData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCategoriesDispute = async (req, res) => {
    try {
        const categoryDisputeData = await categories_dispute_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: categoryDisputeData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Dispute category");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
//get my assets category
const getAssetsCategory = async (req, res) => {
    try {
        const assetsCategoryData = await assets_category_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsCategoryData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets category");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// get asset uses
const getUses = async (req, res) => {
    try {
        const assetsUsesData = await assets_uses_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsUsesData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// get structure type
const getStructureType = async (req, res) => {
    try {
        const assetsStructureTypeData = await assets_structure_type_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsStructureTypeData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getFacadeType = async (req, res) => {
    try {
        const assetsFacadeTypeData = await assets_facade_type_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsFacadeTypeData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getSocialMedia = async (req, res) => {
    try {
        const socialMediaData = await social_media_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    value: 1
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: socialMediaData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getWhyMaintenance = async (req, res) => {
    try {
        const WhyMaintenanceData = await why_maintenance_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    field_name: 1,
                    icon: 1,
                    field_value: 1
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: WhyMaintenanceData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeSuggestion = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { 
        // email,
        // name,
        // mobile_no,
        message, user_id, images, location, subject } = req.body;
        let suggestionData = await new suggestions_model_1.default();
        // suggestionData.email = email;
        // suggestionData.name = name;
        // suggestionData.mobile_no = mobile_no;
        suggestionData.location = location;
        suggestionData.subject = subject;
        suggestionData.message = message;
        if (user_id) {
            suggestionData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        }
        suggestionData.images = JSON.stringify(images);
        await suggestionData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_SUGGESTION_ADDED,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store Suggestion Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const titleCase = (str) => {
    return str.replace(/\w\S*/g, (t) => { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); });
};
const checkDataField = async (req, res) => {
    try {
        const { field, filed_value } = req.body;
        const userData = await user_model_1.default.aggregate([
            {
                $match: {
                    [field]: filed_value,
                    is_verified: true
                }
            },
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "user_name": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "type": 1
                }
            },
        ]);
        console.log(userData);
        let stringRep = field;
        let values = stringRep.replace('_', ' ');
        const str2 = titleCase(values);
        if (userData.length === 0) {
            const sendResponse = {
                data: {},
                message: 'This ' + str2 + ' is available',
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: 'This ' + str2 + ' is already registered ',
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("field Checking api ");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getOurContactUs = (async (req, res) => {
    try {
        const data = await our_contact_us_model_1.default.find();
        let fees_map = {};
        fees_map = await new Map(data.map((values) => [
            values.key, values.value
        ]));
        let feesMapArray = await Object.fromEntries(fees_map.entries());
        const socialMediaData = await social_media_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    value: 1
                },
            },
        ]);
        if (socialMediaData.length > 0) {
            feesMapArray['social_media'] = socialMediaData;
        }
        else {
            feesMapArray['social_media'] = [];
        }
        const sendResponse = {
            data: feesMapArray,
            message: process.env.APP_OUR_CONTACT_US_GET,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Our Contact Us get");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const getOurServices = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let orders = { 'createdAt': -1 };
        const serviceTypeData = await service_type_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "name": 1,
                    "icon": 1,
                    "description": 1,
                    "is_active": 1
                }
            },
            { $sort: orders },
            commonFunction_1.default.isActive(),
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: serviceTypeData.length > 0 ? serviceTypeData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("ServiceType Data get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const getDisputeDetails = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.query;
        let ServiceReq = await service_request_model_1.default.findById(new mongoose_1.default.Types.ObjectId(id));
        if (!ServiceReq) {
            throw new Error(process.env.APP_SR_NOT_FOUND);
        }
        //   if (!ServiceReq.vendor_id.equals(vendor._id)) {
        //     throw new Error("Service Request not Found");
        //   }
        if (ServiceReq.status != "6") //6=disputed
         {
            throw new Error(process.env.APP_SR_NO_ANY_DISPUTE);
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
        logger.info("Get Disput Detail Report");
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
            document: document,
            photo: photo
        });
        if (serviceReq[0] && status && Number(status) === 2) {
            await service_request_model_1.default.findByIdAndUpdate(serviceReq[0]._id, { status: '8' });
        }
        const sendResponse = {
            message: process.env.APP_DISPUTE_UPDATED,
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
        logger.info("Dispute Update on Service Request");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getPostMobile = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, type, user_id, search, page, per_page } = req.body;
        // let skipPage: any = (page && page > 0) ? (Number(Number(page)) * Number(req.body.per_page)) : 0;
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(per_page)) : 0;
        // const user_id:any =req.query.id;
        let filterText = { is_active: true };
        // if (Number(type) === 1 && admin_id) {
        //     filterText = {
        //         admin_id: new mongoose.Types.ObjectId(admin_id),
        //     };
        // }
        // if (Number(type) === 2 && vendor_id) {
        //     filterText = {
        //         $or: [
        //             { "vendor_id": new mongoose.Types.ObjectId(vendor_id) },
        //             { "admin_id": { $exists: true } }
        //         ]
        //     }
        // }
        let countData = await post_model_1.default.count(filterText);
        const postData = await post_model_1.default.aggregate([
            { $sort: { 'createdAt': -1 } },
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [
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
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalComment",
                    pipeline: [
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
            { $unwind: { path: "$postTotalComment", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalComment.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postComments",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $limit: parseInt("2") },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "commentCustomerData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentCustomerData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "commentVendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentVendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "admins",
                                localField: "admin_id",
                                foreignField: "_id",
                                as: "commentAdminData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentAdminData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    // title: 1,
                    // slug: 1,
                    // short_description: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    // is_like: 1,
                    // "postLikes._id": 1,
                    // "postLikes.is_like": 1,
                    // "postComments._id": 1,
                    // "postComments.admin_id": 1,
                    // "postComments.vendor_id": 1,
                    // "postComments.user_id": 1,
                    // "postComments.type": 1,
                    // "postComments.comment": 1,
                    // "postComments.commentCustomerData.first_name": 1,
                    // "postComments.commentCustomerData.last_name": 1,
                    // "postComments.commentAdminData.first_name": 1,
                    // "postComments.commentAdminData.last_name": 1,
                    // "postComments.commentVendorData.first_name": 1,
                    // "postComments.commentVendorData.last_name": 1,
                    "postComments._id": 1,
                    "postComments.admin_id": 1,
                    "postComments.vendor_id": 1,
                    "postComments.user_id": 1,
                    "postComments.type": 1,
                    "postComments.comment": 1,
                    "postComments.commentCustomerData.first_name": 1,
                    "postComments.commentCustomerData.profile_photo": 1,
                    "postComments.commentCustomerData.last_name": 1,
                    "postComments.commentAdminData.first_name": 1,
                    "postComments.commentAdminData.last_name": 1,
                    "postComments.commentAdminData.profile_photo": 1,
                    "postComments.commentVendorData.first_name": 1,
                    "postComments.commentVendorData.last_name": 1,
                    "postComments.commentVendorData.profile_photo": 1,
                    postImageData: 1,
                    "postTotalLike": 1,
                    "postTotalComment": 1,
                },
            },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(req.body.per_page) },
            // { $sort: { 'createdAt': -1 } },
        ]);
        let filterTextLike = { is_active: true };
        // if (admin_id && admin_id !== null) {
        if (Number(type) === 1) {
            filterTextLike = {
                admin_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        // if (vendor_id && vendor_id !== null) {
        if (Number(type) === 2) {
            filterTextLike = {
                vendor_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        // if (user_id && user_id !== null) {
        if (Number(type) === 1) {
            filterTextLike = {
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const checkisLogin = user_id;
        let getpostData = [];
        if (postData.length > 0) {
            await Promise.all(postData.map(async (item) => {
                if (item._id) {
                    let postLikeData = await post_like_model_1.default.aggregate([
                        {
                            $match: filterTextLike
                        },
                        {
                            $match: { "post_id": new mongoose_1.default.Types.ObjectId(item._id) }
                        },
                        {
                            $project: {
                                _id: 1,
                                post_id: 1,
                                vendor_id: 1
                            }
                        }
                    ]);
                    if (checkisLogin && checkisLogin !== null && checkisLogin !== '') {
                        item["is_like"] = postLikeData[0]?._id ? 1 : 0;
                    }
                    else {
                        item["is_like"] = 0;
                    }
                    getpostData.push(item);
                    return;
                }
            }));
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData.length > 0 ? postData : [],
                total: countData,
            }
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
exports.default = {
    uploadFiles,
    uploadImage,
    uploadVideo,
    getCategory,
    getServiceType,
    getAssets,
    GetActiveAdmin,
    GetActiveVendor,
    GetActiveCustomer,
    storeChat,
    storePostLike,
    storePostComment,
    getCheckIsLikePost,
    getChat,
    getPost,
    getRecentPost,
    getPostComment,
    storeContactUs,
    getCms,
    getFaq,
    getPostDetail,
    getCancelReason,
    otpVerification,
    getCategoriesDispute,
    getAssetsCategory,
    getUses,
    getStructureType,
    storePost,
    getFacadeType,
    getSocialMedia,
    getWhyMaintenance,
    storeSuggestion,
    checkDataField,
    getPriority,
    uploadImageMulti,
    getOurContactUs,
    getOurServices,
    getDisputeDetails,
    updateDispute,
    getPostMobile
};
