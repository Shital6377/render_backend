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
const user_model_1 = __importDefault(require("../../models/user-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const stripe = require('stripe')(process.env.STRIPE_KEY);
const firebase_1 = __importDefault(require("../../helper/firebase"));
const uniqid_1 = __importDefault(require("uniqid"));
const moment_1 = __importDefault(require("moment"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const report_request_model_1 = __importDefault(require("../../models/report-request.model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const userDataGet = async (id) => {
    let filterText = {
        _id: new mongoose_1.default.Types.ObjectId(id)
    };
    const userData = await user_model_1.default.aggregate([
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
            $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                role_id: 1,
                profile_photo: 1,
                user_name: 1,
                type: 1,
                mobile_no: 1,
                date_of_birth: 1,
                location: 1,
                service_type_id: 1,
                company_name: 1,
                upload_brochure: 1,
                "serviceTypeData._id": 1,
                "serviceTypeData.name": 1,
            },
        },
        { $match: filterText },
    ]);
    // const userData: any = await User.findById(id).select(
    // 	"_id first_name last_name email role_id profile_photo user_name type mobile_no date_of_birth location service_type_id company_name upload_brochure"
    // );
    return userData[0];
};
const register = async (req, res) => {
    try {
        const { mobile_no, email, first_name, last_name, type, user_name, date_of_birth, password, location, profile_photo, firebase_token, service_type_id, company_name, upload_brochure, token } = req.body;
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        if (!token) {
            const sendResponse = {
                message: process.env.APP_TOKEN_INVALID,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        // if (!clientData.mobile_no) {
        // 	const sendResponse: any = {
        // 		message: "token is not valid or missing",
        // 	};
        // 	return response.sendError(res, sendResponse);
        // }
        let updateData = {
            unique_id: (0, uniqid_1.default)(),
            first_name: first_name,
            mobile_no: mobile_no,
            last_name: last_name,
            user_name: user_name,
            type: type,
            email: email,
            date_of_birth: date_of_birth,
            location: location,
            password: passwordHash,
            is_verified: true,
            profile_photo: profile_photo ? profile_photo : process.env.DUMMY_PROFILE_IMAGE
        };
        if (Number(type) === 2) {
            updateData.upload_brochure = upload_brochure;
            updateData.company_name = company_name;
            updateData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        }
        let updateCondition = {};
        if (clientData.mobile_no) {
            updateCondition = { mobile_no: clientData.mobile_no };
        }
        if (clientData.email) {
            updateCondition = { email: clientData.email };
        }
        const userData = await user_model_1.default.findOneAndUpdate(updateCondition, updateData);
        let balance = 0;
        const customerInStripe = await stripe.customers.create({
            description: 'Create New Customer ' + email,
            balance: balance,
            email: email,
            name: first_name + last_name,
            phone: userData.mobile_no,
        });
        userData.stripe_user_id = customerInStripe.id;
        userData.stripe_payload = JSON.stringify(customerInStripe);
        userData.wallet_amount = balance;
        userData.save();
        const tokenLogin = await jwt_1.default.sign({
            email: email,
            mobilenumber: userData.mobile,
            user_id: userData._id?.toString(),
        });
        if (userData && userData._id) {
            await user_token_model_1.default.create({
                token: tokenLogin,
                firebase_token: firebase_token,
                user_id: userData._id,
            });
        }
        let userName = 'user';
        if (Number(type) === 2) {
            userName = 'Service Provider';
        }
        if (userData && userData._id) {
            if (userData) {
                // start here Push 
                let pushTitle = first_name + ' ' + last_name + ' register successfully';
                let message = 'new' + ' ' + userName + ' ' + 'registered successfully';
                let payload = userData;
                await notification_model_1.default.create({
                    user_id: userData._id,
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                });
                const userNotification = await user_model_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(userData._id)
                });
                let getToken = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(userData._id)
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
            // end here push 
        }
        let sendData = await userDataGet(userData._id);
        // let customersData = sendData.toJSON();
        sendData["access_token"] = tokenLogin;
        const sendResponse = {
            data: sendData,
            message: process.env.APP_USER_REGISTER,
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
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email: email });
        if (!user) {
            const sendResponse = {
                message: process.env.APP_WITH_EMAIL_NOT_EXITS,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            email: email,
            user_id: user._id,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                user_id: user._id,
                is_active: true,
                expiry: expiry,
            },
        ]);
        try {
            let message = process.env.APP_NAME + " is your Otp  " + otp;
            //start  send Sms onMobile
            await commonFunction_1.default.smsGatway(user.mobile_no, message);
        }
        catch (err) {
            logger.info("EmailwithMessage");
            logger.info(err);
        }
        try {
            let to = user.email;
            let subject = process.env.APP_NAME + ' Forgot Password Otp';
            let template = 'customer-forget-password';
            let sendEmailTemplatedata = {
                name: user.first_name + user.last_name,
                otp: otp,
                app_name: process.env.APP_NAME,
            };
            let datta = {
                to: to,
                subject: subject,
                template: template,
                sendEmailTemplatedata: sendEmailTemplatedata
            };
            await commonFunction_1.default.sendEmailTemplate(datta);
        }
        catch (err) {
            logger.info("Forget Password send email  ");
            logger.info(err);
        }
        // Email Services write down
        const sendResponse = {
            data: {
                token: token,
                otp: otp,
            },
            message: process.env.APP_OTP_SEND_EMAIL,
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
        await user_model_1.default.findByIdAndUpdate(clientData.user_id, {
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
const login = async (req, res) => {
    try {
        const { email, password, firebase_token } = req.body;
        const userData = await user_model_1.default.findOne({
            $or: [
                { 'email': email },
                { 'user_name': { $regex: `${email}`, $options: "i" } }
            ],
            deleted_by: null,
        });
        if (userData) {
            if (!userData.password) {
                const sendResponse = {
                    message: process.env.APP_INVALID_PASSWORD,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            if (!userData.is_active) {
                const sendResponse = {
                    message: process.env.APP_ACCOUND_BLOCKED_MESSAGE,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            const ispasswordmatch = await bcrypt_1.default.compare(password, userData.password);
            if (!ispasswordmatch) {
                const sendResponse = {
                    message: process.env.APP_WRONG_PASSWORD_MESSAGE,
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            else {
                const token = await jwt_1.default.sign({
                    email: userData.email,
                    mobilenumber: userData.mobile,
                    user_id: userData._id?.toString(),
                });
                if (userData && userData._id) {
                    await user_token_model_1.default.create({
                        token: token,
                        firebase_token: firebase_token,
                        user_id: userData._id,
                    });
                }
                const sendData = await userDataGet(userData._id);
                // let customersData = sendData.toJSON();
                sendData["access_token"] = token;
                const sendResponse = {
                    data: sendData ? sendData : {},
                    message: process.env.APP_LOGGED_MESSAGE,
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: process.env.APP_EMAIL_PASSWROD_INCORRECT_MESSAGE,
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
};
const changePassword = async (req, res) => {
    try {
        const { old_password, password } = req.body;
        // @ts-ignore
        const user_id = req?.user?._id;
        const userData = await user_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(user_id),
        });
        if (userData) {
            const isComparePassword = await bcrypt_1.default.compare(old_password, userData.password);
            if (isComparePassword) {
                const passwordhash = await bcrypt_1.default.hash(password, Number(10));
                await user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(user_id), {
                    password: passwordhash,
                    updated_by: userData.first_name,
                    updated_on: new Date(),
                }, {
                    new: true,
                });
                const sendResponse = {
                    message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
                    data: {}
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
            else {
                const sendResponse = {
                    message: process.env.APP_PASSWORD_INCORRECT_MESSAGE,
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
        logger.info(process.env.APP_PASSWROD_CHANGED_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const readNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        await notification_model_1.default.updateMany({
            "user_id": new mongoose_1.default.Types.ObjectId(user_id)
        }, {
            is_read: true,
        });
        const sendResponse = {
            data: {},
            message: process.env.APP_ALL_NOTIFOCATION_READ_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_ALL_NOTIFOCATION_READ_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCountNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const notificationData = await notification_model_1.default.count([
            { $match: { user_id: new mongoose_1.default.Types.ObjectId(user_id) } },
        ]);
        const sendResponse = {
            data: (notificationData.length) > 0 ? notificationData : {},
            message: process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const { page, per_page } = req.body;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText = {};
        filterText = {
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
        };
        let countData = await notification_model_1.default.count(filterText);
        const notificationData = await notification_model_1.default.aggregate([
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
                    user_id: 1,
                    type: 1,
                    title: 1,
                    message: 1,
                    notification: 1,
                    is_active: 1,
                    createdAt: 1,
                    // payload:1,
                    "userData.first_name": 1,
                    "userData.last_name": 1,
                    "userData.profile_photo": 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        const sendResponse = {
            data: {
                data: notificationData,
                total: countData,
            },
            message: process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const clearNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        let filterText = {};
        filterText = {
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
        };
        await notification_model_1.default.deleteMany(filterText);
        const sendResponse = {
            message: 'Notification' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const clearSelectedNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const { id } = req.body;
        console.log('idd', id);
        // let filterText: object = {}
        // filterText = {
        // 	user_id: new mongoose.Types.ObjectId(user_id),
        // };
        // const objectIdsToDelete = id.map((ids: any) => new mongoose.Types.ObjectId(ids));
        if (id) {
            await notification_model_1.default.deleteMany({ _id: { $in: id } });
        }
        const sendResponse = {
            message: 'Notification' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_NOTIFOCATION_COUNT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getProfile = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user._id;
        console.log("user_id", user_id);
        const sendResponse = {
            data: await userDataGet(user_id),
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
};
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, profile_photo, user_name, date_of_birth, mobile_no, location, company_name, upload_brochure, service_type_id, } = req.body;
        // @ts-ignore
        const user_id = req?.user?._id;
        // @ts-ignore
        const type = req?.user?.type;
        let updateData = {
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            user_name: user_name,
            email: email,
            date_of_birth: date_of_birth,
            location: location,
            mobile_no: mobile_no,
        };
        if (Number(type) === 2) {
            updateData.upload_brochure = upload_brochure;
            updateData.company_name = company_name;
            updateData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        }
        await user_model_1.default.findByIdAndUpdate(user_id, updateData);
        const userData = await userDataGet(user_id);
        const sendResponse = {
            data: userData ? userData : {},
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
};
const uploadBrochure = async (req, res) => {
    try {
        const { upload_brochure, } = req.body;
        // @ts-ignore
        const user_id = req?.user?._id;
        if (upload_brochure.indexOf(".pdf") != -1) {
            await user_model_1.default.findByIdAndUpdate(user_id, {
                upload_brochure: upload_brochure,
            });
            const sendResponse = {
                data: {},
                message: 'brochure' + process.env.APP_STORE_MESSAGE
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: process.env.APP_PDF_FILE_ONLY_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('brochure' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const logout = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const token = req.headers["authorization"]?.split(" ")[1];
        let getToken = await user_token_model_1.default.findOne({
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
            token: token,
        });
        if (getToken) {
            await user_token_model_1.default.deleteOne(new mongoose_1.default.Types.ObjectId(getToken._id.toString()), {
                is_active: false,
            });
            const sendResponse = {
                message: process.env.APP_LOGOUT_MESSAGE,
                data: {}
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
        logger.info(process.env.APP_LOGOUT_MESSAGE);
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const mobileVerification = async (req, res) => {
    try {
        const { mobile_no, email } = req.body;
        let dataCheking = {};
        if (mobile_no) {
            dataCheking = { mobile_no: mobile_no };
        }
        if (email) {
            dataCheking = { email: email };
        }
        let user = await user_model_1.default.findOne(dataCheking);
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        if (user) {
            if (user.is_verified) {
                const sendResponse = {
                    message: process.env.APP_MOBILE_EXIST_MESSAGE,
                    data: {}
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        else {
            user = await user_model_1.default.create(dataCheking);
        }
        // dont remove
        console.log(otp);
        if (mobile_no) {
            try {
                let message = process.env.APP_NAME + " is your Otp  " + otp;
                //start  send email
                const smsGatwayData = await commonFunction_1.default.smsGatway(mobile_no, message);
                if (smsGatwayData === false) {
                    const sendResponse = {
                        message: `The number ${mobile_no} is not a valid phone number`,
                    };
                    return responseMiddleware_1.default.sendError(res, sendResponse);
                }
            }
            catch (err) {
                logger.info("EmailwithMessage");
                logger.info(err);
            }
        }
        if (email) {
            try {
                let to = user.email;
                let subject = process.env.APP_NAME + ' Otp Is' + otp;
                let template = 'otp-send';
                let sendEmailTemplatedata = {
                    otp: otp,
                    app_name: process.env.APP_NAME,
                };
                let datta = {
                    to: to,
                    subject: subject,
                    template: template,
                    sendEmailTemplatedata: sendEmailTemplatedata
                };
                await commonFunction_1.default.sendEmailTemplate(datta);
            }
            catch (err) {
                logger.info("Otp Send send email  ");
                logger.info(err);
            }
        }
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            mobile_no: mobile_no,
            email: email,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                isActive: true,
                expiry: expiry,
            },
        ]);
        const sendResponse = {
            data: {
                token: token,
                otp: otp,
            },
            message: process.env.APP_OTP_SEND_MESSAGE,
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
const getDataSR = (async (filterText) => {
    let serviceRequestData = await service_request_model_1.default.aggregate([
        { $match: filterText },
        {
            $lookup: {
                from: "bids",
                localField: "_id",
                foreignField: "service_request_id",
                as: "bidsData",
            },
        },
        { $unwind: { path: "$bidsData", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                "_id": 1,
                "status": 1,
                "is_active": 1,
                createdAtFormatted: {
                    $dateToString: { format: "%m/%Y", date: "$createdAt" },
                },
                "bidsData.vendor_id": 1,
            }
        },
        { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    return serviceRequestData.length > 0 ? serviceRequestData[0]?.count : 0;
});
const countDataSr = async (filterText) => {
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
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "vendorData",
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
        { $match: filterText },
        { $group: { _id: "$_id" } },
        { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    return countData.length > 0 ? countData[0].count : 0;
};
const dashboardCustomer = (async (req, res) => {
    const user_id = req.query.id;
    const userType = req.user.type;
    try {
        let monthArray = [];
        let dataSRArray = [];
        const today = new Date();
        const currentMonth = (0, moment_1.default)(today).startOf('month').format('M');
        for (let i = 0; i < Number(currentMonth); i++) {
            let date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            let obj = {
                month_text: (0, moment_1.default)(date).startOf('month').format('MMMM YYYY'),
                month_digit: (0, moment_1.default)(date).startOf('month').format('MM/YYYY'),
                start_date: (0, moment_1.default)(date).startOf('month').format('YYYY-MM-DD'),
                end_date: (0, moment_1.default)(date).endOf('month').format('YYYY-MM-DD'),
            };
            monthArray.push(obj);
        }
        await monthArray.map(async (item, i) => {
            let obj = {
                initiated: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "0",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                bids_received: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "2",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                awarded: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "8",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                completed: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "5",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                closed: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "4",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                disputed: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "6",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                expired: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "status": "7",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                cancelled: await getDataSR({
                    "user_id": new mongoose_1.default.Types.ObjectId(user_id),
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
            serviceRequestInitiated: await service_request_model_1.default.find({ "status": 2, 'is_active': true, 'user_id': new mongoose_1.default.Types.ObjectId(user_id) }).count(),
            serviceRequestOngoing: await service_request_model_1.default.find({
                status: { $in: ["8"] },
                // status: { $in: ["5", "6", "8"] },
                'is_active': true,
                'user_id': new mongoose_1.default.Types.ObjectId(user_id)
            }).count(),
            serviceRequestCompleted: await service_request_model_1.default.find({ "status": 5, 'is_active': true, 'user_id': new mongoose_1.default.Types.ObjectId(user_id) }).count(),
            serviceRequestDisputed: await service_request_model_1.default.find({ "status": 6, 'is_active': true, 'user_id': new mongoose_1.default.Types.ObjectId(user_id) }).count(),
            serviceRequestClosed: await service_request_model_1.default.find({
                status: { $in: ["4", "10"] },
                'is_active': true,
                'user_id': new mongoose_1.default.Types.ObjectId(user_id)
            }).count(),
            serviceRequestExpired: await service_request_model_1.default.find({ "status": 7, 'is_active': true, 'user_id': new mongoose_1.default.Types.ObjectId(user_id) }).count(),
            serviceRequestCancelled: await service_request_model_1.default.find({ "status": 9, 'is_active': true, 'user_id': new mongoose_1.default.Types.ObjectId(user_id) }).count(),
            monthlyActivity: await dataSRArray,
        };
        let filterTextBlockeId = {};
        let getReportUSer = (await report_request_model_1.default.find({
            from_user_id: new mongoose_1.default.Types.ObjectId(user_id)
        })).map(value => value.to_user_id);
        // if (getReportUSer) {
        // 	filterTextBlockeId = {
        // 		$and: [{
        // 			user_id: { $nin: getReportUSer },
        // 			vendor_id: { $nin: getReportUSer },
        // 		}]
        // 	};
        // }
        const spDashBoardData = {
            // serviceRequestJobForBidding: await ServiceRequest.find({ 'status': { $in: ["2", "3"] }, 'is_active': true }).count(),
            serviceRequestJobForBidding: await countDataSr({
                "bidsData.vendor_id": { $nin: [new mongoose_1.default.Types.ObjectId(user_id)] },
                $and: [
                    { 'is_active': true },
                    { status: { $in: ["2", "3"] } },
                    { user_id: { $nin: getReportUSer } },
                    { vendor_id: { $nin: getReportUSer } },
                ],
            }),
            serviceRequestMyOnGoingJob: await countDataSr({ 'is_active': true, "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), status: { $in: ["5", "6", "8"] } }),
            ServiceRequestDeliverAndCloseJob: await countDataSr({ "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), $and: [{ status: { $in: ["4", "7", "10"] } }] }),
            ServiceRequestCancelJob: await countDataSr({ "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), $and: [{ status: { $in: ["9"] } }] }),
            ServiceRequestSubmitedBid: await countDataSr({
                "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id),
                $and: [
                    { "bidsData.status": { $in: ["1", "2", "4"] } },
                    { "bidsData.is_active": true }
                ],
            }),
            ServiceRequestAwareded: await countDataSr({ "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), $and: [{ status: { $in: ["3", "8"] } }] }),
            serviceRequestCompleted: await countDataSr({ "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), $and: [{ status: { $in: ["5"] } }] }),
            serviceRequestDisputed: await countDataSr({ "bidsData.vendor_id": new mongoose_1.default.Types.ObjectId(user_id), $and: [{ status: { $in: ["6"] } }] }),
        };
        const dashboardData = Number(userType) === 1 ? data : spDashBoardData;
        const sendResponse = {
            data: dashboardData ? dashboardData : {},
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
// Export default
exports.default = {
    register,
    forgetPassword,
    resetPassword,
    getNotification,
    clearNotification,
    login,
    changePassword,
    getProfile,
    updateProfile,
    logout,
    mobileVerification,
    getCountNotification,
    readNotification,
    uploadBrochure,
    dashboardCustomer,
    clearSelectedNotification
};
