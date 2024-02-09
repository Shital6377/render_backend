'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const categories_dispute_model_1 = __importDefault(require("../models/categories-dispute-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Poor Vendor Performance',
        is_active: true,
    },
    {
        name: 'Poor Quality of Materials',
        is_active: true,
    },
    {
        name: 'Poor Workmanship/Installation',
        is_active: true,
    },
    {
        name: 'Delay',
        is_active: true,
    },
    {
        name: 'Process Efficiency',
        is_active: true,
    },
    {
        name: 'Payment Issue',
        is_active: true,
    },
    {
        name: 'Accident/Incident Report',
        is_active: true,
    },
    {
        name: 'Misbehaviour, Abuse, Fraud, Criminal Act',
        is_active: true,
    },
    {
        name: 'Others',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await categories_dispute_model_1.default.deleteMany({});
        await categories_dispute_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
