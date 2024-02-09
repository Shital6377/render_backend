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
const admin_model_1 = __importDefault(require("../../models/admin-model"));
const role_model_1 = __importDefault(require("../../models/role-model"));
const firebase_1 = require("../../helper/firebase");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uniqid_1 = __importDefault(require("uniqid"));
const sensor_model_1 = __importDefault(require("../../models/sensor-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "_id",
    "first_name",
    "last_name",
    "mobile_no",
    "email",
    "is_admin",
    "unique_id",
    "is_active"
];
const allSensorFiled = [
    "_id",
    "sensordata",
    "devicetoken",
    "address",
    "day"
];
let project = {};
let projectSensor = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
    await allSensorFiled.map(function async(item) {
        projectSensor[item] = 1;
    });
};
getAllFiled();
const getAll = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const userData = await admin_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "profile_photo": 1,
                    "is_active": 1,
                }
            },
        ]);
        const sendResponse = {
            message: 'Sub-admin' + ' ' + process.env.APP_GET_MESSAGE,
            data: userData.length > 0 ? userData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Sub-admin' + ' ' + process.env.APP_GET_MESSAGE);
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
        const { per_page, page, sort_field, sort_direction } = req.query;
        let filterText = {};
        let filter = req.query.search;
        filter = filter ? filter.replace(" 91", "") : "";
        filter = filter ? filter.replace("%", "") : "";
        let filterTextValue = await commonFunction_1.default.checkSpecialChr(filter);
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
            const filterTextField = [];
            await allFiled.map((filed) => {
                let filedData = {
                    [filed]: {
                        $regex: `${filterTextValue}`, $options: "i"
                    }
                };
                filterTextField.push(filedData);
            });
            filterText = {
                ...filterText,
                $or: filterTextField
            };
            if (mongoose_1.default.Types.ObjectId.isValid(filterTextValue)) {
                filterText = {
                    $or: [{ _id: new mongoose_1.default.Types.ObjectId(filterTextValue) }],
                };
            }
        }
        const userData = await admin_model_1.default.aggregate([
            {
                $addFields: {
                    "_id": { $toString: "$_id" }
                }
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
            message: process.env.APP_GET_MESSAGE,
            data: userData.length > 0 ? userData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('admin' + process.env.APP_GET_MESSAGE);
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
        await admin_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Sub-admin' + ' ' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Sub-admin' + ' ' + process.env.APP_DELETE_MESSAGE);
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
    const userData = await admin_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        { $project: project },
    ]);
    return userData.length > 0 ? userData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'User' + ' ' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('User' + ' ' + process.env.APP_EDIT_GET_MESSAGE);
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
        const userData = await admin_model_1.default.findOne({ _id: id });
        userData.is_active = status;
        await userData.save();
        const message = `Sub-admin status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
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
const changeStatusFirebase = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const userData = await user_model_1.default.findOne({ _id: id });
        userData.firebase_is_active = status;
        await userData.save();
        const message = `User Firebase Notification status ${(status === "true") ? 'Approved' : 'Not Allowed'} successfully`;
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
const changeStatusEmail = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const userData = await user_model_1.default.findOne({ _id: id });
        userData.email_is_active = status;
        await userData.save();
        const message = `User Email Notifcation status ${(status === "true") ? 'Allowed' : 'Not Allowed'} successfully`;
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
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    var roleData = await role_model_1.default.findOne({ 'name': 'admin' });
    try {
        // let id: number = req.body.id;
        const { first_name, last_name, mobile_no, email, profile_photo, password } = req.body;
        let userData = {};
        let message;
        const query = {
            $or: [{ email: email }, { mobile_no: mobile_no }]
        };
        userData = await admin_model_1.default.findOne(query);
        if (userData) {
            if (userData.email === email) {
                message = `User Already exists, with this email address, use different email!`;
            }
            if (userData.mobile_no === mobile_no) {
                message = `User Already exists, with this mobie no, use different mobile no!`;
            }
            const responseData = {
                message: message,
                data: null,
            };
            return responseMiddleware_1.default.sendSuccess(req, res, responseData);
        }
        else {
            userData = await new admin_model_1.default();
            message = 'Sub-admin added succesfully';
            userData.unique_id = (0, uniqid_1.default)();
        }
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        userData.first_name = first_name;
        userData.last_name = last_name;
        userData.is_admin = "sub-admin";
        userData.mobile_no = mobile_no;
        userData.email = email;
        userData.password = passwordHash;
        userData.profile_photo = profile_photo;
        userData.role_id = roleData._id;
        await userData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(userData._id),
        };
        let to = email;
        let subject = process.env.APP_NAME + ' Welcome to the board';
        let template = 'welcome-sub-admin';
        let sendEmailTemplatedata = {
            first_name: first_name,
            last_name: last_name,
            name: first_name + last_name,
            password: password,
            website_link: process.env.ADMIN_LINK,
            // token: 'token',
            app_name: process.env.APP_NAME,
            // reset_button: process.env.ADMIN_LINK + 'reset-password/' + 'token',
        };
        let datta = {
            to: to,
            subject: subject,
            template: template,
            sendEmailTemplatedata: sendEmailTemplatedata
        };
        await commonFunction_1.default.sendEmailTemplate(datta);
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Sub-admin' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const changeUserPassword = async (req, res) => {
    try {
        const { user_id, password, updated_by } = req.body;
        // @ts-ignore
        // const user_id = req?.customer?._id;
        const userData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(user_id),
        });
        if (userData) {
            const passwordhash = await bcrypt_1.default.hash(password, Number(10));
            await admin_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(user_id), {
                password: passwordhash,
                updated_by: updated_by,
            }, {
                new: true,
            });
            const sendResponse = {
                message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: process.env.APP_ADMIN_NOT_FOUND_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_PASSWROD_CHANGED_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const exportUser = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { type, sort_field, sort_direction } = req.query;
        let filterText = {};
        if (type) {
            filterText = {
                ...filterText,
                type: type
            };
        }
        let orders = {};
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        const userData = await user_model_1.default.aggregate([
            { $match: filterText },
            { $sort: orders },
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "user_name": 1,
                    "type": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "profile_photo": 1,
                    "location": 1,
                    "is_active": 1,
                }
            },
        ]);
        const sendResponse = {
            message: 'User' + process.env.APP_GET_MESSAGE,
            data: userData.length > 0 ? userData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('User' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const sendNotification = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const token = [];
        const address = [];
        const { location, title, notification_body } = req.body;
        const arr = location.map((key) => {
            return new mongoose_1.default.Types.ObjectId(key);
        });
        const obj = {
            title: title,
            notification_body: notification_body,
        };
        let sensorData = await sensor_model_1.default.aggregate([
            { $match: { _id: { "$in": arr } } },
            { $project: projectSensor },
        ]).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));
        if (sensorData[0]) {
            sensorData.map(key => {
                token.push(key.devicetoken);
                address.push(key.address);
            });
        }
        sensorData = await sensor_model_1.default.aggregate([
            { $match: { address: { "$in": address } } },
            { $project: projectSensor },
        ]).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));
        if (sensorData[0]) {
            sensorData.map(key => {
                if (!(token.includes(key.devicetoken))) {
                    token.push(key.devicetoken);
                }
            });
        }
        else {
            const responseData = {
                message: "Data not Found.",
            };
            return await responseMiddleware_1.default.sendError(res, responseData);
        }
        await (0, firebase_1.sendPushNotification)(token, obj);
        const sendResponse = {
            message: 'Notification sent to user',
            data: {}
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('User' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    get,
    getAll,
    store,
    changeStatus,
    changeStatusFirebase,
    changeStatusEmail,
    edit,
    destroy,
    changeUserPassword,
    exportUser,
    sendNotification
};
