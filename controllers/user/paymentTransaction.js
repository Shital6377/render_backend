"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const cards_model_1 = __importDefault(require("../../models/cards-model"));
const stripe = require('stripe')(process.env.STRIPE_KEY);
const user_model_1 = __importDefault(require("../../models/user-model"));
const bid_request_model_1 = __importDefault(require("../../models/bid-request-model"));
const payment_transaction_model_1 = __importDefault(require("../../models/payment-transaction-model"));
const my_earning_model_1 = __importDefault(require("../../models/my-earning-model"));
const { v4: uuidv4 } = require('uuid');
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Create/Sotre Payment Method ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { bid_id, card_id } = req.body;
        const bidData = await bid_request_model_1.default.findById(bid_id);
        if (!bidData) {
            const sendResponse = {
                message: process.env.APP_BID_NOT_FOUND_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        // if (!bidData.is_active) {
        //     const sendResponse: any = {
        //         message: process.env.APP_BID_EXPIRED_MESSAGE,
        //     };
        //     return response.sendError(res, sendResponse);
        // }
        const userData = await user_model_1.default.findById(bidData.user_id);
        const cardData = await cards_model_1.default.findById(card_id);
        if (!cardData) {
            const sendResponse = {
                message: process.env.APP_ADD_CARD_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        let amount = bidData.amount;
        // let amount = '1';
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(parseFloat(amount) * 100),
            currency: "INR",
            description: "the Bid Id is " + bidData._id + " have received the Payment.",
            customer: userData.stripe_user_id,
            payment_method: cardData.stripe_card_id,
            confirm: true,
            payment_method_types: ['card'],
        });
        let transfer_reference_id = uuidv4();
        const amountreceiveduserData = await user_model_1.default.findOne({ _id: bidData.vendor_id });
        let newAmount = parseFloat(amountreceiveduserData.wallet_amount) + parseFloat(amount);
        let received_amount = ((parseFloat(amount) * parseFloat(amountreceiveduserData.current_commission)) / 100);
        // let sp_received_amount: any = ((parseFloat(amount) * parseFloat(amountreceiveduserData.current_commission)) / 100);
        let sp_received_amount = ((parseFloat(amount) - 1.3));
        // let admin_received_amount = ((parseFloat(amount)) - (parseFloat(sp_received_amount)));
        let admin_received_amount = 5;
        // let admin_received_amount = 1.3;
        let status = await commonFunction_1.default.stripePaymentIntentStatus(paymentIntent.status);
        await payment_transaction_model_1.default.create({
            user_id: new mongoose_1.default.Types.ObjectId(userData._id),
            bid_id: new mongoose_1.default.Types.ObjectId(bidData._id),
            card_id: new mongoose_1.default.Types.ObjectId(cardData._id),
            vendor_id: new mongoose_1.default.Types.ObjectId(bidData.vendor_id),
            amount: amount,
            received_amount: received_amount,
            commission_charge: 0,
            service_charge: 0,
            status: status,
            discount: 0,
            stripe_payload: JSON.stringify(paymentIntent),
            stripe_request_id: paymentIntent.id,
            transfer_reference_id: transfer_reference_id,
            admin_percentage: (100 - (amountreceiveduserData.current_commission)),
            vendor_percentage: amountreceiveduserData.current_commission,
        });
        await my_earning_model_1.default.create({
            vendor_id: new mongoose_1.default.Types.ObjectId(bidData.vendor_id),
            user_id: new mongoose_1.default.Types.ObjectId(userData._id),
            bid_id: new mongoose_1.default.Types.ObjectId(bidData._id),
            card_id: new mongoose_1.default.Types.ObjectId(cardData._id),
            sp_received_amount: sp_received_amount,
            amount: amount,
            admin_received_amount: admin_received_amount,
            old_wallet_amount: amountreceiveduserData.wallet_amount,
            new_wallet_amount: newAmount,
            status: status,
            transfer_reference_id: transfer_reference_id,
            admin_percentage: (100 - (amountreceiveduserData.current_commission)),
            vendor_percentage: amountreceiveduserData.current_commission,
        });
        amountreceiveduserData.wallet_amount = newAmount;
        await amountreceiveduserData.save();
        const srData = await service_request_model_1.default.findOne({ _id: bidData.service_request_id });
        srData.is_payment_done = true;
        await srData.save();
        if (amountreceiveduserData) {
            // start here Push            
            try {
                let today = new Date();
                let year = today.getFullYear();
                let mes = today.getMonth() + 1;
                let dia = today.getDate();
                let todayDate = dia + "-" + mes + "-" + year;
                let message_from = process.env.APP_NAME + ': $' + amount + ' debited on ' + todayDate + ' New Balance : ' + amountreceiveduserData.wallet_amount;
                let pushTitle = 'transaction made';
                let message = message_from;
                let payload = amountreceiveduserData;
                await notification_model_1.default.create({
                    user_id: amountreceiveduserData._id,
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                });
                const userNotification = await user_model_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(amountreceiveduserData._id)
                });
                let getToken = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(amountreceiveduserData._id),
                    firebase_token: { $ne: null }
                })).map(value => value.firebase_token);
                if (userNotification && userNotification.firebase_is_active) {
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
            }
            catch (err) {
                logger.info("sendPushNotification");
                logger.info(err);
            }
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: process.env.APP_PM_DONE_MESSAGE,
            data: {},
        };
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
exports.default = {
    store,
};
