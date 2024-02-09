'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const assets_uses_model_1 = __importDefault(require("../models/assets-uses-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Residential',
        is_active: true,
    },
    {
        name: 'Offices',
        is_active: true,
    },
    {
        name: 'Hotel',
        is_active: true,
    },
    {
        name: 'Shopping Center, Mall, Exhibition',
        is_active: true,
    },
    {
        name: 'Retail Shop, Café, Restaurant, Club',
        is_active: true,
    },
    {
        name: 'Hospital, Medical Center, Clinic',
        is_active: true,
    },
    {
        name: 'Industrial, Factory, Garage, Laboratory',
        is_active: true,
    },
    {
        name: 'Store, Library',
        is_active: true,
    },
    {
        name: 'Car Park',
        is_active: true,
    },
    {
        name: 'University, Institute, School, Training Center',
        is_active: true,
    },
    {
        name: 'Sport Facility',
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
        await assets_uses_model_1.default.deleteMany({});
        await assets_uses_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
