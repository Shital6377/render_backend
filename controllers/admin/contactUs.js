"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const contactus_model_1 = __importDefault(require("../../models/contactus-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "_id",
    "email",
    "name",
    "location",
    "mobile_no",
    "images",
    "user_id",
    "message",
    "is_active",
    "userData._id",
    "userData.type",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
    "createdAt",
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
        const { search, per_page, page, sort_field, sort_direction, type } = req.query;
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
        if (type) {
            filterText = {
                ...filterText,
                "userData.type": type,
            };
        }
        const contactUsData = await contactus_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             type: type,
                    //         }
                    //     },
                    //     {
                    //         $project: {
                    //             type: "1",
                    //         },
                    //     },
                    // ],
                    as: "userData",
                },
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
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
            message: 'Contact Us' + process.env.APP_GET_MESSAGE,
            data: contactUsData.length > 0 ? contactUsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Contact Us' + process.env.APP_GET_MESSAGE);
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
        await contactus_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Contact Us' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Contact Us' + process.env.APP_DELETE_MESSAGE);
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
    const contactUsData = await contactus_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        { $project: project },
    ]);
    return contactUsData.length > 0 ? contactUsData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Contact Us' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('Contact Us' + process.env.APP_EDIT_GET_MESSAGE);
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
        const contactUsData = await contactus_model_1.default.findOne({ _id: id });
        contactUsData.is_active = status;
        await contactUsData.save();
        const message = `ContactUs status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
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
    try {
        let id = req.body.id;
        const { email, first_name, last_name, user_id, messages, } = req.body;
        let contactUsData = {};
        let message;
        if (id) {
            contactUsData = await contactus_model_1.default.findOne({ _id: id });
            message = 'Contact Us' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            contactUsData = await new contactus_model_1.default();
            message = 'Contact Us' + process.env.APP_STORE_MESSAGE;
        }
        contactUsData.email = email;
        contactUsData.first_name = first_name;
        contactUsData.last_name = last_name;
        contactUsData.message = messages;
        contactUsData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        await contactUsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(contactUsData._id),
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Contact Us' + process.env.APP_STORE_MESSAGE);
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
    destroy,
};
