'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const priority_model_1 = __importDefault(require("../models/priority-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Low',
        is_active: true,
    },
    {
        name: 'Medium',
        is_active: true,
    },
    {
        name: 'Urgent',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await priority_model_1.default.deleteMany({});
        await priority_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
