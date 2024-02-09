"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("../validate_"));
const store = async (req, res, next) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id;
    }
    const validationRule = {
        "category_id": "required",
        "asset_uses_id": "required",
        "structural_type_id": "required",
        "facade_type_data_id": "required",
        "description": "required",
        "year_built": "required",
        "gross_area": "required",
        "build_area": "required",
        "build_cost": "required",
        "current_value": "required",
        "current_issues": "required",
        "Previous_issue": "required",
        "general_rating": "required",
        "structural_rating": "required",
        "cleanliness_rating": "required",
        "fitout_rating": "required",
        "floors_rating": "required",
        "doors_rating": "required",
        "windows_rating": "required",
        "wall_partitionin_rating": "required",
        "secondary_ceiling_rating": "required",
        "coating_rating": "required",
        "metal_rating": "required",
        "tile_cladding_rating": "required",
        "glass_cladding_rating": "required",
        "wooden_cladding_rating": "required",
        "railing_condition_rating": "required",
        "roofing_condition_rating": "required",
        "fence_condition_rating": "required",
        "gate_condition_rating": "required",
        "sanitary_condition_rating": "required",
        "pumping_condition_rating": "required",
        "ac_condition_rating": "required",
        "electrical_condition_rating": "required",
        "lift_condition_rating": "required",
        "external_areas_condition_rating": "required",
        "gardening_condition_rating": "required",
        "hard_landscape_condition_rating": "required",
        "escalator_condition_rating": "required",
        "photo": "required",
    };
    validate_1.default.validatorUtilWithCallback(validationRule, {}, req, res, next);
};
exports.default = {
    store,
};
