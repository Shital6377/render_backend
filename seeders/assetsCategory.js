'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const assets_category_model_1 = __importDefault(require("../models/assets-category-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Villa/Townhouse',
        is_active: true,
    },
    {
        name: 'Apartment',
        is_active: true,
    },
    {
        name: 'Building',
        is_active: true,
    },
    {
        name: 'Tower/High Rise Building',
        is_active: true,
    },
    {
        name: 'Facility',
        is_active: true,
    },
    {
        name: 'Warehouse',
        is_active: true,
    },
    {
        name: 'Portable/Temporary building, Kiosk, Caravan, Tent',
        is_active: true,
    },
    {
        name: 'Yard, Park, Farm',
        is_active: true,
    },
    {
        name: 'Mall',
        is_active: true,
    },
    {
        name: 'Shopping Center',
        is_active: true,
    },
    {
        name: 'Other',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await assets_category_model_1.default.deleteMany({});
        await assets_category_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
