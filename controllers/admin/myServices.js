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
        let vendor_id = req.query.vendor_id;
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
            let service_type_all = [];
            if (servicesData && servicesData[0]?.services) {
                service_type_all = await service_type_model_1.default.aggregate([
                    { $match: { "_id": { '$in': servicesData[0].services } } },
                    commonFunction_1.default.isActive(),
                    {
                        $project: {
                            _id: 1,
                            is_active: 1,
                            name: 1,
                            icon: 1,
                        },
                    },
                ]);
            }
            if (service_type_all.length > 0) {
                servicesData[0]['service_type_all'] = service_type_all;
            }
            const sendResponse = {
                message: 'My Service' + process.env.APP_GET_MESSAGE,
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
        logger.info('My Service' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    get,
};
