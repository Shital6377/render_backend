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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Create/Sotre Payment Method ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { id, number, exp_date, cvc } = req.body;
        const expDateArray = exp_date.split("-");
        let cardDataStore = {};
        let message;
        if (id) {
            cardDataStore = await cards_model_1.default.findOne({ _id: id });
            message = 'Card' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            cardDataStore = new cards_model_1.default();
            message = 'Card' + process.env.APP_STORE_MESSAGE;
        }
        const userData = await user_model_1.default.findById(user_id).select("_id first_name last_name email stripe_user_id");
        let token = [];
        try {
            token = await stripe.tokens.create({
                // card: {
                //     number: '4242424242424242',
                //     exp_month: 12,
                //     exp_year: 2023,
                //     cvc: '314',
                // },
                card: {
                    number: number,
                    exp_month: expDateArray[1],
                    exp_year: expDateArray[0],
                    cvc: cvc,
                },
            });
        }
        catch (err) {
            logger.info(process.env.APP_INVALID_CARD_MESSAGE);
            logger.info(err);
            const sendResponse = {
                message: process.env.APP_INVALID_CARD_MESSAGE,
            };
            await session.abortTransaction();
            session.endSession();
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        if (token && userData) {
            try {
                if (userData.stripe_user_id) {
                    const card = await stripe.customers.createSource(userData.stripe_user_id, { source: token.id });
                    const cardData = await cards_model_1.default.aggregate([
                        {
                            $match: {
                                $and: [{ user_id: new mongoose_1.default.Types.ObjectId(user_id) }],
                            },
                        },
                    ]);
                    const checkExits = cardData.some((v, i) => {
                        if (!id) {
                            return v.number === card.number;
                        }
                        else if (v._id !== id) {
                            return v.number === card.number;
                        }
                        else if (v._id === id) {
                            return false;
                        }
                    });
                    if (!checkExits) {
                        // await Card.updateOne({
                        cardDataStore.user_id = new mongoose_1.default.Types.ObjectId(user_id);
                        cardDataStore.stripe_payload = JSON.stringify(card);
                        cardDataStore.stripe_card_id = card.id;
                        cardDataStore.card_no = card.id;
                        cardDataStore.source = token.id;
                        cardDataStore.brand = card.brand;
                        cardDataStore.exp_month = card.exp_month;
                        cardDataStore.exp_year = card.exp_year;
                        cardDataStore.funding = card.funding;
                        cardDataStore.last4 = card.last4;
                        cardDataStore.number = number;
                        await cardDataStore.save();
                        // }); 
                    }
                    else {
                        logger.info(process.env.APP_CARD_AL_EXIST_MESSAGE);
                        const sendResponse = {
                            message: process.env.APP_CARD_AL_EXIST_MESSAGE,
                        };
                        return responseMiddleware_1.default.sendError(res, sendResponse);
                    }
                }
            }
            catch (err) {
                const sendResponse = {
                    message: err.message,
                };
                logger.info(process.env.APP_CARD_AL_EXIST_MESSAGE);
                logger.info(err);
                return responseMiddleware_1.default.sendError(res, sendResponse);
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
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Payment Method Lists =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAll = async (req, res) => {
    const user = req.user;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const cards = await cards_model_1.default.aggregate([
            {
                $match: {
                    $and: [{ user_id: new mongoose_1.default.Types.ObjectId(user._id) }],
                },
            },
            {
                $project: {
                    "_id": 1,
                    "user_id": 1,
                    "brand": 1,
                    "exp_month": 1,
                    "exp_year": 1,
                    "funding": 1,
                    "last4": 1,
                    "card_no": 1,
                    "source": 1,
                    "number": 1,
                }
            },
        ]);
        const sendResponse = {
            message: 'Card' + process.env.APP_GET_MESSAGE,
            data: (cards).length > 0 ? cards : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Card' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await cards_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Card' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Card' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Payment Method Detail by ID ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getCard = async (req, res) => {
    const user = req.user;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.query;
        const cards = await cards_model_1.default.aggregate([
            {
                $match: {
                    $and: [
                        { user_id: user._id },
                        { _id: new mongoose_1.default.Types.ObjectId(id) },
                    ],
                },
            },
            {
                $project: {
                    "_id": 1,
                    "user_id": 1,
                    "brand": 1,
                    "exp_month": 1,
                    "exp_year": 1,
                    "funding": 1,
                    "last4": 1,
                    "card_no": 1,
                    "source": 1,
                    "number": 1,
                }
            },
        ]);
        const sendResponse = {
            message: 'Card' + process.env.APP_GET_MESSAGE,
            data: (cards).length ? cards[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Card' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
exports.default = {
    store,
    destroy,
    getAll,
    getCard,
};
