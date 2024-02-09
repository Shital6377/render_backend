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
// add and update my assets data
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const user_id = req.user._id;
        const { category_id, asset_uses_id, structural_type_id, facade_type_data_id, description, year_built, gross_area, build_area, build_cost, current_value, current_issues, Previous_issue, general_rating, structural_rating, cleanliness_rating, fitout_rating, floors_rating, doors_rating, windows_rating, wall_partitionin_rating, secondary_ceiling_rating, coating_rating, metal_rating, tile_cladding_rating, glass_cladding_rating, wooden_cladding_rating, railing_condition_rating, roofing_condition_rating, fence_condition_rating, gate_condition_rating, sanitary_condition_rating, pumping_condition_rating, ac_condition_rating, electrical_condition_rating, lift_condition_rating, external_areas_condition_rating, gardening_condition_rating, hard_landscape_condition_rating, escalator_condition_rating, photo, notes, estimated_maintenance_costs } = req.body;
        let myAssetsData = {};
        let message;
        if (id) {
            myAssetsData = await my_asset_model_1.default.findOne({ _id: id });
            message = 'My Asset' + process.env.APP_UPDATE_MESSAGE;
        }
        else {
            myAssetsData = new my_asset_model_1.default();
            message = 'My Asset' + process.env.APP_STORE_MESSAGE;
        }
        myAssetsData.title = 'Asset Data Form';
        myAssetsData.category_id = category_id;
        myAssetsData.user_id = user_id;
        myAssetsData.asset_uses_id = asset_uses_id;
        myAssetsData.structural_type_id = structural_type_id;
        myAssetsData.facade_type_data_id = facade_type_data_id;
        myAssetsData.description = description;
        myAssetsData.year_built = year_built;
        myAssetsData.gross_area = gross_area;
        myAssetsData.build_area = build_area;
        myAssetsData.build_cost = build_cost;
        myAssetsData.current_value = current_value;
        myAssetsData.current_issues = current_issues;
        myAssetsData.Previous_issue = Previous_issue;
        myAssetsData.general_rating = general_rating;
        myAssetsData.structural_rating = structural_rating;
        myAssetsData.cleanliness_rating = cleanliness_rating;
        myAssetsData.fitout_rating = fitout_rating;
        myAssetsData.floors_rating = floors_rating;
        myAssetsData.doors_rating = doors_rating;
        myAssetsData.windows_rating = windows_rating;
        myAssetsData.wall_partitionin_rating = wall_partitionin_rating;
        myAssetsData.secondary_ceiling_rating = secondary_ceiling_rating;
        myAssetsData.coating_rating = coating_rating;
        myAssetsData.metal_rating = metal_rating;
        myAssetsData.tile_cladding_rating = tile_cladding_rating;
        myAssetsData.glass_cladding_rating = glass_cladding_rating;
        myAssetsData.wooden_cladding_rating = wooden_cladding_rating;
        myAssetsData.railing_condition_rating = railing_condition_rating;
        myAssetsData.roofing_condition_rating = roofing_condition_rating;
        myAssetsData.fence_condition_rating = fence_condition_rating;
        myAssetsData.gate_condition_rating = gate_condition_rating;
        myAssetsData.sanitary_condition_rating = sanitary_condition_rating;
        myAssetsData.pumping_condition_rating = pumping_condition_rating;
        myAssetsData.ac_condition_rating = ac_condition_rating;
        myAssetsData.electrical_condition_rating = electrical_condition_rating;
        myAssetsData.lift_condition_rating = lift_condition_rating;
        myAssetsData.external_areas_condition_rating = external_areas_condition_rating;
        myAssetsData.gardening_condition_rating = gardening_condition_rating;
        myAssetsData.hard_landscape_condition_rating = hard_landscape_condition_rating;
        myAssetsData.escalator_condition_rating = escalator_condition_rating;
        // myAssetsData.photo = photo;
        myAssetsData.notes = notes;
        myAssetsData.estimated_maintenance_costs = estimated_maintenance_costs;
        await myAssetsData.save();
        if (photo) {
            await asset_image_model_1.default.deleteMany({ asset_id: new mongoose_1.default.Types.ObjectId(id), });
            photo.map(async (img, i) => {
                let assetImageData = await new asset_image_model_1.default();
                assetImageData.asset_id = new mongoose_1.default.Types.ObjectId(myAssetsData._id);
                assetImageData.image = photo[i];
                await assetImageData.save();
            });
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
            data: {}
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('My Asset' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// get all my assets  list
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const user_id = req.user._id;
    try {
        const { search, page, per_page, sort_direction, sort_field } = req.query;
        let filterText = {
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
        };
        let filterTextValue = search;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let orders = {};
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { title: { $regex: `${filterTextValue}`, $options: "i" } },
                    { is_active: { $regex: `${filterTextValue}`, $options: "i" } },
                    { estimated_maintenance_costs: { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            };
        }
        let countData = await my_asset_model_1.default.count(filterText);
        const myAssetsData = await my_asset_model_1.default.aggregate([
            {
                $match: filterText
            },
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
                    from: 'asset_uses',
                    localField: 'asset_uses_id',
                    foreignField: '_id',
                    as: 'assetUsesData'
                }
            },
            { $unwind: { path: "$assetUsesData", preserveNullAndEmptyArrays: true } },
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
                    from: 'asset_structure_type',
                    localField: 'structural_type_id',
                    foreignField: '_id',
                    as: 'structuralTypeData'
                }
            },
            { $unwind: { path: "$structuralTypeData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'asset_facade_type',
                    localField: 'facade_type_data_id',
                    foreignField: '_id',
                    as: 'facadeTypeData'
                }
            },
            { $unwind: { path: "$facadeTypeData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "categoryTypeData.name": 1,
                    "assetUsesData.name": 1,
                    "structuralTypeData.name": 1,
                    "facadeTypeData.name": 1,
                    "_id": 1,
                    "title": 1,
                    "category_id": 1,
                    "user_id": 1,
                    "structural_type_id": 1,
                    "facade_type_data_id": 1,
                    "asset_uses_id": 1,
                    "description": 1,
                    "year_built": 1,
                    "gross_area": 1,
                    "build_area": 1,
                    "build_cost": 1,
                    "current_value": 1,
                    "current_issues": 1,
                    "Previous_issue": 1,
                    "general_rating": 1,
                    "is_active": 1,
                    "notes": 1,
                    "createdAt": 1,
                    "estimated_maintenance_costs": 1,
                    "assetImageData.image": 1,
                    cleanliness_rating: 1,
                    fitout_rating: 1,
                    floors_rating: 1,
                    doors_rating: 1,
                    windows_rating: 1,
                    wall_partitionin_rating: 1,
                    secondary_ceiling_rating: 1,
                    coating_rating: 1,
                    metal_rating: 1,
                    tile_cladding_rating: 1,
                    glass_cladding_rating: 1,
                    wooden_cladding_rating: 1,
                    railing_condition_rating: 1,
                    roofing_condition_rating: 1,
                    fence_condition_rating: 1,
                    gate_condition_rating: 1,
                    sanitary_condition_rating: 1,
                    pumping_condition_rating: 1,
                    ac_condition_rating: 1,
                    electrical_condition_rating: 1,
                    lift_condition_rating: 1,
                    external_areas_condition_rating: 1,
                    gardening_condition_rating: 1,
                    hard_landscape_condition_rating: 1,
                    escalator_condition_rating: 1,
                    structural_rating: 1,
                }
            },
            { $sort: orders },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        const sendResponse = {
            message: 'My Asset' + process.env.APP_STORE_MESSAGE,
            data: {
                data: myAssetsData.length > 0 ? myAssetsData : [],
                total: countData,
            }
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('My Asset' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
//get data using id
const getData = (async (id) => {
    const myAssetsData = await my_asset_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: "asset_images",
                localField: "_id",
                foreignField: "asset_id",
                as: "assetImageData",
            },
        },
        {
            $project: {
                "_id": 1,
                "title": 1,
                "category_id": 1,
                "asset_uses_id": 1,
                "user_id": 1,
                "structural_type_id": 1,
                "facade_type_data_id": 1,
                "description": 1,
                "year_built": 1,
                "gross_area": 1,
                "build_area": 1,
                "build_cost": 1,
                "current_value": 1,
                "current_issues": 1,
                "Previous_issue": 1,
                "general_rating": 1,
                "structural_rating": 1,
                "cleanliness_rating": 1,
                "fitout_rating": 1,
                "floors_rating": 1,
                "doors_rating": 1,
                "windows_rating": 1,
                "wall_partitionin_rating": 1,
                "secondary_ceiling_rating": 1,
                "coating_rating": 1,
                "metal_rating": 1,
                "tile_cladding_rating": 1,
                "glass_cladding_rating": 1,
                "wooden_cladding_rating": 1,
                "railing_condition_rating": 1,
                "roofing_condition_rating": 1,
                "fence_condition_rating": 1,
                "gate_condition_rating": 1,
                "sanitary_condition_rating": 1,
                "pumping_condition_rating": 1,
                "ac_condition_rating": 1,
                "electrical_condition_rating": 1,
                "lift_condition_rating": 1,
                "external_areas_condition_rating": 1,
                "gardening_condition_rating": 1,
                "hard_landscape_condition_rating": 1,
                "escalator_condition_rating": 1,
                // "photo": 1,
                "assetImageData.image": 1,
                "notes": 1,
                "estimated_maintenance_costs": 1,
                "is_active": 1,
                "createdAt": 1
            }
        },
    ]);
    return (myAssetsData) ? myAssetsData[0] : {};
});
// get my assets data using Id
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            message: 'My Asset' + process.env.APP_EDIT_GET_MESSAGE,
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
        logger.info('My Asset' + process.env.APP_EDIT_GET_MESSAGE);
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
            message: 'My Asset' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('My Asset' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const changeStatus = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const assetsData = await my_asset_model_1.default.findOne({ _id: id });
        assetsData.is_active = status;
        await assetsData.save();
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
// Export default
exports.default = {
    edit,
    get,
    store,
    destroy,
    changeStatus
};
