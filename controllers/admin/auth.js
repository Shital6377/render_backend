"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("../../helper/jwt"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const admin_model_1 = __importDefault(require("../../models/admin-model"));
const admin_token_model_1 = __importDefault(require("../../models/admin-token-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
// import Category from '../../models/category-model';
// import Post from '../../models/post-model';
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const my_earning_model_1 = __importDefault(require("../../models/my-earning-model"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const moment_1 = __importDefault(require("moment"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getDataSR = (async (filterText) => {
    let serviceRequestData = await service_request_model_1.default.aggregate([
        { $match: filterText },
        {
            $project: {
                "_id": 1,
                "status": 1,
                "is_active": 1,
                createdAtFormatted: {
                    $dateToString: { format: "%m/%Y", date: "$createdAt" },
                },
            }
        },
        { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    return serviceRequestData.length > 0 ? serviceRequestData[0]?.count : 0;
});
const dashboard = (async (req, res) => {
    try {
        const totalAdminSum = await my_earning_model_1.default.aggregate([
            // { $match: { status: "9" } },
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
        const totalSum = await my_earning_model_1.default.aggregate([
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
        let monthArray = [];
        let dataSRArray = [];
        const today = new Date();
        for (let i = 0; i < 6; i++) {
            let date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            let obj = {
                month_text: (0, moment_1.default)(date).startOf('month').format('MMMM YYYY'),
                month_digit: (0, moment_1.default)(date).startOf('month').format('MM/YYYY'),
                start_date: (0, moment_1.default)(date).startOf('month').format('YYYY-MM-DD'),
                end_date: (0, moment_1.default)(date).endOf('month').format('YYYY-MM-DD'),
            };
            monthArray.push(obj);
        }
        let checkingLoop = await monthArray.map(async (item, i) => {
            let obj = {
                initiated: await getDataSR({
                    "status": "0",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                bids_received: await getDataSR({
                    "status": "2",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                awarded: await getDataSR({
                    "status": "8",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                completed: await getDataSR({
                    "status": "5",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                closed: await getDataSR({
                    "status": "4",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                disputed: await getDataSR({
                    "status": "6",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                expired: await getDataSR({
                    "status": "7",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                cancelled: await getDataSR({
                    "status": "9",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                month_text: item.month_text,
                month_digit: item.month_digit,
                inedx: i + 1,
            };
            await dataSRArray.push(obj);
        });
        const data = {
            activeServiceProvider: await user_model_1.default.find({ "type": 2, 'is_active': true }).count(),
            activeCustomer: await user_model_1.default.find({ "type": 1, 'is_active': true }).count(),
            allServiceProvider: await user_model_1.default.find({ "type": 2 }).count(),
            allCustomer: await user_model_1.default.find({ "type": 1 }).count(),
            currentMonthErning: (totalAdminSum[0]) ? Math.round(totalAdminSum[0].totalReceivedAmount) : 0,
            currentMonthErningTotal: (totalSum[0]) ? Math.round(totalSum[0].totalReceivedAmount) : 0,
            serviceRequestInitiated: await service_request_model_1.default.find({ "status": 2, 'is_active': true }).count(),
            serviceRequestOngoing: await service_request_model_1.default.find({ "status": 8 }).count(),
            serviceRequestCompleted: await service_request_model_1.default.find({ "status": 5, 'is_active': true }).count(),
            serviceRequestDisputed: await service_request_model_1.default.find({ "status": 6, 'is_active': true }).count(),
            serviceRequestClosed: await service_request_model_1.default.find({ "status": 4, 'is_active': true }).count(),
            serviceRequestExpired: await service_request_model_1.default.find({ "status": 7, 'is_active': true }).count(),
            serviceRequestCancelled: await service_request_model_1.default.find({ "status": 9 }).count(),
            monthlyActivity: await dataSRArray,
        };
        const sendResponse = {
            data: data ? data : {},
            message: 'Dashboard' + process.env.APP_GET_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Dashboard' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const adminsDataGet = (async (id) => {
    const adminData = await admin_model_1.default.findById(id).select("_id first_name last_name email role_id profile_photo is_admin");
    return adminData;
});
const login = (async (req, res) => {
    try {
        const { email, password, firebase_token } = req.body;
        const adminData = await admin_model_1.default.findOne({
            email,
            deleted_by: null,
        });
        if (adminData) {
            if (adminData.is_active === "false") {
                const sendResponse = {
                    message: process.env.APP_BLOCKED,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            if (!adminData.password) {
                const sendResponse = {
                    message: process.env.APP_INVALID_PASSWORD,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            const ispasswordmatch = await bcrypt_1.default.compare(password, adminData.password);
            if (!ispasswordmatch) {
                const sendResponse = {
                    message: 'Oops, password is incorrect',
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            else {
                const token = await jwt_1.default.sign({
                    email: email,
                    mobilenumber: adminData.mobile,
                    admin_id: adminData._id?.toString()
                });
                if (adminData && adminData._id) {
                    await admin_token_model_1.default.create({
                        token: token,
                        firebase_token: firebase_token,
                        admin_id: adminData._id,
                    });
                }
                const sendData = await adminsDataGet(adminData._id);
                let AdminsData = sendData.toJSON();
                AdminsData['access_token'] = token;
                const sendResponse = {
                    data: AdminsData ? AdminsData : {},
                    status: 200,
                    message: process.env.APP_LOGGED_MESSAGE,
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
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
        logger.info(process.env.APP_EMAIL_PASSWROD_INCORRECT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const changePassword = (async (req, res) => {
    try {
        const { old_password, password } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        if (adminData) {
            const isComparePassword = await bcrypt_1.default.compare(old_password, adminData.password);
            if (isComparePassword) {
                if (old_password === password) {
                    const sendResponse = {
                        message: process.env.APP_PASSWROD_DIFFERENT_MESSAGE,
                    };
                    return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
                }
                else {
                    const passwordhash = await bcrypt_1.default.hash(password, Number(10));
                    await admin_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(admin_id), {
                        password: passwordhash,
                        updated_by: adminData.first_name,
                        updated_on: new Date()
                    }, {
                        new: true
                    });
                    const sendResponse = {
                        message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
                    };
                    return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
                }
            }
            else {
                const sendResponse = {
                    message: process.env.APP_INVALID_PASSWORD_MESSAGE,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
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
        logger.info(process.env.APP_ADMIN_NOT_FOUND_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const getProfile = (async (req, res) => {
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        const sendResponse = {
            data: adminData,
            message: process.env.APP_PROFILE_GET_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_PROFILE_GET_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const updateProfile = (async (req, res) => {
    try {
        const { first_name, last_name, email, profile_photo, mobile_no } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        await admin_model_1.default.findByIdAndUpdate(admin_id, {
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            email: email,
            mobile_no: mobile_no
        });
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        const sendResponse = {
            data: adminData,
            message: process.env.APP_PROFILE_UPDATE_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_PROFILE_UPDATE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const logout = (async (req, res) => {
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const token = req.headers['authorization']?.split(" ")[1];
        let getToken = await admin_token_model_1.default.findOne({
            admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            token: token
        });
        if (getToken) {
            await admin_token_model_1.default.deleteOne(new mongoose_1.default.Types.ObjectId(getToken._id.toString()), {
                is_active: false
            });
            const sendResponse = {
                message: process.env.APP_LOGOUT_MESSAGE,
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: process.env.APP_INVALID_TOKEN_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_INVALID_TOKEN_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await admin_model_1.default.findOne({ email: email });
        if (!admin) {
            const sendResponse = {
                message: process.env.APP_ADMIN_NOT_FOUND_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            email: email,
            admin_id: admin._id,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                admin_id: admin._id,
                is_active: true,
                expiry: expiry,
            },
        ]);
        logger.info("token");
        logger.info(token);
        try {
            let to = admin.email;
            let subject = process.env.APP_NAME + ' Reset Password Link';
            let template = 'forget-code-admin';
            let sendEmailTemplatedata = {
                name: admin.first_name + admin.last_name,
                token: token,
                app_name: process.env.APP_NAME,
                reset_button: process.env.ADMIN_LINK + 'reset-password/' + token,
            };
            let datta = {
                to: to,
                subject: subject,
                template: template,
                sendEmailTemplatedata: sendEmailTemplatedata
            };
            const sendResponse = {
                message: process.env.APP_PASSWROD,
            };
            await commonFunction_1.default.sendEmailTemplate(datta);
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        catch (err) {
            logger.info(process.env.APP_ADMIN_NOT_MESSAGE);
            logger.info(err);
        }
        // Email Services write down
        const sendResponse = {
            message: process.env.APP_LINK_SEND_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const resetPassword = async (req, res) => {
    try {
        const { password, confirm_password, token } = req.body;
        if (!token) {
            const sendResponse = {
                message: process.env.APP_INVALID_TOKEN_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        const expired = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        await admin_model_1.default.findByIdAndUpdate(clientData.admin_id, {
            password: passwordHash,
        });
        const sendResponse = {
            message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
            data: {}
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// Export default
exports.default = {
    login,
    changePassword,
    getProfile,
    dashboard,
    updateProfile,
    forgetPassword,
    resetPassword,
    logout
};
