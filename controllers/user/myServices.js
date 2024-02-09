"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const my_services_model_1 = __importDefault(require("../../models/my-services-model"));
const service_type_model_1 = __importDefault(require("../../models/service-type-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const allFiled = [
    "_id",
    "description",
    "services",
    "is_active",
    "notes",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let vendor_id = req.user._id;
        let service_type_all = [];
        if (req.query.vendor_id) {
            vendor_id = req.query.vendor_id;
        }
        if (vendor_id) {
            const servicesData = await my_services_model_1.default.aggregate([
                { $match: { "vendor_id": new mongoose_1.default.Types.ObjectId(vendor_id) } },
                {
                    $project: {
                        ...project,
                    }
                },
                { $sort: { 'createdAt': -1 } },
            ]);
            if (servicesData[0] && servicesData[0].services) {
                service_type_all = await service_type_model_1.default.aggregate([
                    { $match: { "_id": { '$in': servicesData[0].services } } },
                    commonFunction_1.default.isActive(),
                    {
                        $project: {
                            _id: 1,
                            is_active: 1,
                            name: 1,
                            icon: 1,
                            description: 1
                        },
                    },
                ]);
            }
            if (servicesData[0]) {
                servicesData[0]['service_type_all'] = service_type_all;
            }
            const sendResponse = {
                message: 'My Services' + process.env.APP_GET_MESSAGE,
                data: servicesData.length > 0 ? servicesData[0] : [],
            };
            await session.commitTransaction();
            session.endSession();
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('My Services' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let vendor_id = req.user._id;
        const { description, services,
        // vendor_id
         } = req.body;
        let myServicesData = {};
        let message;
        if (id) {
            myServicesData = await my_services_model_1.default.findOne({ _id: id });
            message = 'My Services' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            myServicesData = await new my_services_model_1.default();
            const myServicesCheck = await my_services_model_1.default.findOne({ vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id) });
            message = 'My Services' + process.env.APP_STORE_MESSAGE;
            if (myServicesCheck && !id) {
                const sendResponse = {
                    message: process.env.APP_ADD_SR_TO_SP_MESSAGE,
                };
                logger.info(process.env.APP_ADD_SR_TO_SP_MESSAGE);
                await session.abortTransaction();
                session.endSession();
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        myServicesData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
        myServicesData.description = description;
        myServicesData.services = services;
        await myServicesData.save();
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
        logger.info('My Services' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const addUpdateOurServiceNotes = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let vendor_id = req.user._id;
        const { notes
        // vendor_id
         } = req.body;
        let myServicesData = {};
        let message;
        if (id) {
            message = 'Our Service Notes' + process.env.APP_UPDATE_MESSAGE;
            await my_services_model_1.default.findByIdAndUpdate(id, { notes: notes });
        }
        else {
            myServicesData = await new my_services_model_1.default();
            const myServicesCheck = await my_services_model_1.default.findOne({ vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id) });
            message = 'Our Service Notes' + process.env.APP_STORE_MESSAGE;
            if (myServicesCheck && !id) {
                const sendResponse = {
                    message: process.env.APP_ADD_SR_TO_SP_MESSAGE,
                };
                await session.abortTransaction();
                session.endSession();
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            else {
                myServicesData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
                myServicesData.notes = notes;
                await myServicesData.save();
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
        logger.info('Our Service Notes' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    store,
    get,
    addUpdateOurServiceNotes,
};
