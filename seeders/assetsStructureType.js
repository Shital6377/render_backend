'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const assets_structure_type_model_1 = __importDefault(require("../models/assets-structure-type-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Concrete',
        is_active: true,
    },
    {
        name: 'Steel',
        is_active: true,
    },
    {
        name: 'Steel and Concrete',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await assets_structure_type_model_1.default.deleteMany({});
        await assets_structure_type_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
