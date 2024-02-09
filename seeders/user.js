'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        const password = "1234567";
        const passwordhash = await bcrypt_1.default.hash(password, Number(10));
        // await User.deleteMany({});
        return await user_model_1.default.create([{
                first_name: 'Juhi',
                last_name: 'Kothwala',
                user_name: 'jk_kothwala',
                mobile_no: '7575030796',
                type: '1',
                email: 'customer@admin.com',
                password: passwordhash,
                location: '{\"address\":\"Surat, Gujarat, India\",\"latitude\":21.1702401,\"longitude\":21.1702401}',
                profile_photo: 'https://maintenancemasters.s3.amazonaws.com/admin/1672840141072download%20%286%29.jpg',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }]);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
