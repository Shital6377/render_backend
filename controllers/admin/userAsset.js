"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const my_asset_model_1 = __importDefault(require("../../models/my-asset-model"));
const asset_image_model_1 = __importDefault(require("../../models/asset-image-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "categoryTypeData.name",
    "asset_uses_id",
    "assetUsesData.name",
    "structuralTypeData",
    "facadeTypeData.name",
    "userData._id",
    "userData.first_name",
    "userData.last_name",
    "_id",
    "title",
    "category_id",
    "user_id",
    "structural_type_id",
    "facade_type_data_id",
    "description",
    "year_built",
    "gross_area",
    "build_area",
    "build_cost",
    "current_value",
    "current_issues",
    "Previous_issue",
    "is_active",
    "createdAt",
    "general_rating",
    "structural_rating",
    "cleanliness_rating",
    "fitout_rating",
    "floors_rating",
    "doors_rating",
    "windows_rating",
    "wall_partitionin_rating",
    "secondary_ceiling_rating",
    "coating_rating",
    "metal_rating",
    "tile_cladding_rating",
    "glass_cladding_rating",
    "wooden_cladding_rating",
    "railing_condition_rating",
    "roofing_condition_rating",
    "fence_condition_rating",
    "gate_condition_rating",
    "sanitary_condition_rating",
    "pumping_condition_rating",
    "ac_condition_rating",
    "electrical_condition_rating",
    "lift_condition_rating",
    "external_areas_condition_rating",
    "gardening_condition_rating",
    "hard_landscape_condition_rating",
    "escalator_condition_rating",
    "photo",
    "notes",
    "estimated_maintenance_costs",
    "facade_type_data_id",
    "asset_uses_id",
    "assetImageData.image",
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
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText = {};
        let filterTextValue = search;
        let orders = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        const select_user_id = (req.query.user_id) ?? req.query.user_id;
        if (select_user_id && select_user_id !== 'undefined' || select_user_id !== undefined) {
            filterText = {
                user_id: new mongoose_1.default.Types.ObjectId(select_user_id)
            };
        }
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
        const assetsUsesData = await my_asset_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'asset_categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'categoryTypeData'
                }
            },
            { $unwind: { path: "$categoryTypeData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "asset_images",
                    localField: "_id",
                    foreignField: "asset_id",
                    as: "assetImageData",
                },
            },
            {
                $lookup: {
                    from: 'asset_uses',
                    localField: 'asset_uses_id',
                    foreignField: '_id',
                    as: 'assetUsesData'
                }
            },
            { $unwind: { path: "$assetUsesData", preserveNullAndEmptyArrays: true } },
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
                    from: 'asset_structure_type',
                    localField: 'structural_type_id',
                    foreignField: '_id',
                    as: 'structuralTypeData'
                }
            },
            { $unwind: { path: "$structuralTypeData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'asset_facadeTypeData',
                    localField: 'facadeTypeData_id',
                    foreignField: '_id',
                    as: 'facadeTypeData'
                }
            },
            { $unwind: { path: "$facadeTypeData", preserveNullAndEmptyArrays: true } },
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
            message: 'Assets Uses' + process.env.APP_GET_MESSAGE,
            data: assetsUsesData.length > 0 ? assetsUsesData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Assets Uses' + process.env.APP_GET_MESSAGE);
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
        await my_asset_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            message: 'Assets Uses' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Assets Uses' + process.env.APP_DELETE_MESSAGE);
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
    const assetsUsesData = await my_asset_model_1.default.aggregate([
        {
            $lookup: {
                from: "asset_images",
                localField: "_id",
                foreignField: "asset_id",
                as: "assetImageData",
            },
        },
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        { $project: project },
    ]);
    return assetsUsesData.length > 0 ? assetsUsesData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'Assets Uses' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('Assets Uses' + process.env.APP_EDIT_GET_MESSAGE);
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
        const assetsUsesData = await my_asset_model_1.default.findOne({ _id: id });
        assetsUsesData.is_active = status;
        await assetsUsesData.save();
        const message = `User status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
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
        const { category_id, user_id, structural_type_id, facade_type_data_id, description, year_built, gross_area, build_area, build_cost, current_value, current_issues, Previous_issue, general_rating, structural_rating, cleanliness_rating, fitout_rating, floors_rating, doors_rating, windows_rating, wall_partitionin_rating, secondary_ceiling_rating, coating_rating, metal_rating, tile_cladding_rating, glass_cladding_rating, wooden_cladding_rating, railing_condition_rating, roofing_condition_rating, fence_condition_rating, gate_condition_rating, sanitary_condition_rating, pumping_condition_rating, ac_condition_rating, electrical_condition_rating, lift_condition_rating, external_areas_condition_rating, gardening_condition_rating, hard_landscape_condition_rating, escalator_condition_rating, photo, notes, asset_uses_id, estimated_maintenance_costs } = req.body;
        let assetsUsesData = {};
        let message;
        if (id) {
            assetsUsesData = await my_asset_model_1.default.findOne({ _id: id });
            message = 'Assets Uses' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            assetsUsesData = await new my_asset_model_1.default();
            message = 'Assets Uses' + process.env.APP_STORE_MESSAGE;
        }
        assetsUsesData.title = 'Asset Data Form';
        if (category_id) {
            assetsUsesData.category_id = category_id;
        }
        if (user_id) {
            assetsUsesData.user_id = user_id;
        }
        if (structural_type_id) {
            assetsUsesData.structural_type_id = structural_type_id;
        }
        if (facade_type_data_id) {
            assetsUsesData.facade_type_data_id = facade_type_data_id;
        }
        if (asset_uses_id) {
            assetsUsesData.asset_uses_id = asset_uses_id;
        }
        assetsUsesData.description = description;
        assetsUsesData.year_built = year_built;
        assetsUsesData.gross_area = gross_area;
        assetsUsesData.build_area = build_area;
        assetsUsesData.build_cost = build_cost;
        assetsUsesData.current_value = current_value;
        assetsUsesData.current_issues = current_issues;
        assetsUsesData.Previous_issue = Previous_issue;
        assetsUsesData.general_rating = general_rating;
        assetsUsesData.structural_rating = structural_rating;
        assetsUsesData.cleanliness_rating = cleanliness_rating;
        assetsUsesData.fitout_rating = fitout_rating;
        assetsUsesData.floors_rating = floors_rating;
        assetsUsesData.doors_rating = doors_rating;
        assetsUsesData.windows_rating = windows_rating;
        assetsUsesData.wall_partitionin_rating = wall_partitionin_rating;
        assetsUsesData.secondary_ceiling_rating = secondary_ceiling_rating;
        assetsUsesData.coating_rating = coating_rating;
        assetsUsesData.metal_rating = metal_rating;
        assetsUsesData.tile_cladding_rating = tile_cladding_rating;
        assetsUsesData.glass_cladding_rating = glass_cladding_rating;
        assetsUsesData.wooden_cladding_rating = wooden_cladding_rating;
        assetsUsesData.railing_condition_rating = railing_condition_rating;
        assetsUsesData.roofing_condition_rating = roofing_condition_rating;
        assetsUsesData.fence_condition_rating = fence_condition_rating;
        assetsUsesData.gate_condition_rating = gate_condition_rating;
        assetsUsesData.sanitary_condition_rating = sanitary_condition_rating;
        assetsUsesData.pumping_condition_rating = pumping_condition_rating;
        assetsUsesData.ac_condition_rating = ac_condition_rating;
        assetsUsesData.electrical_condition_rating = electrical_condition_rating;
        assetsUsesData.lift_condition_rating = lift_condition_rating;
        assetsUsesData.external_areas_condition_rating = external_areas_condition_rating;
        assetsUsesData.gardening_condition_rating = gardening_condition_rating;
        assetsUsesData.hard_landscape_condition_rating = hard_landscape_condition_rating;
        assetsUsesData.escalator_condition_rating = escalator_condition_rating;
        // assetsUsesData.photo = photo;
        assetsUsesData.notes = notes;
        assetsUsesData.estimated_maintenance_costs = estimated_maintenance_costs;
        if (photo) {
            await asset_image_model_1.default.deleteMany({ asset_id: new mongoose_1.default.Types.ObjectId(id), });
            photo.map(async (img, i) => {
                let assetImageData = await new asset_image_model_1.default();
                assetImageData.asset_id = new mongoose_1.default.Types.ObjectId(assetsUsesData._id);
                assetImageData.image = photo[i];
                await assetImageData.save();
            });
        }
        await assetsUsesData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: await getData(assetsUsesData._id),
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Assets Uses' + process.env.APP_STORE_MESSAGE);
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
