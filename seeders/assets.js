'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const asset_model_1 = __importDefault(require("../models/asset-model"));
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
        name: 'Warehouse, Industrial Facility',
        is_active: true,
    },
    {
        name: 'Infrastructure',
        is_active: true,
    },
    {
        name: 'General Facility',
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
        name: 'Shop',
        is_active: true,
    },
    {
        name: 'Office',
        is_active: true,
    },
    {
        name: 'Hotel',
        is_active: true,
    },
    {
        name: 'Hospital',
        is_active: true,
    },
    {
        name: 'Store',
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
        await asset_model_1.default.deleteMany({});
        await asset_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
