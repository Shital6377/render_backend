'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const cancel_reason_model_1 = __importDefault(require("../models/cancel-reason-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        reson: 'High Prices',
        is_active: true,
    },
    {
        reson: 'Rescheduling the Maintenance',
        is_active: true,
    },
    {
        reson: 'Delay in receiving bids',
        is_active: true,
    },
    {
        reson: 'No bids were received',
        is_active: true,
    },
    {
        reson: 'I am using another platform',
        is_active: true,
    },
    {
        reson: 'I hired others to deliver the service to me',
        is_active: true,
    },
    {
        reson: 'I have changed my mind',
        is_active: true,
    },
    {
        reson: 'Others',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await cancel_reason_model_1.default.deleteMany({});
        await cancel_reason_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
