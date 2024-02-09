'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const mongoose_1 = __importDefault(require("mongoose"));
const admin_model_1 = __importDefault(require("../models/admin-model"));
const role_model_1 = __importDefault(require("../models/role-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        var roleData = await role_model_1.default.findOne({ 'name': 'super_admin' });
        const password = "admin@123";
        const passwordhash = await bcrypt_1.default.hash(password, Number(10));
        await admin_model_1.default.deleteMany({});
        return await admin_model_1.default.create([{
                first_name: 'Admin',
                last_name: 'Admin',
                email: 'admin@admin.com',
                role_id: roleData._id,
                is_admin: 'admin',
                mobile_no: '2345678912',
                password: passwordhash,
                is_superadmin: 'yes',
                is_active: true,
                createdAt: new Date(),
                updated_at: new Date(),
            },
            {
                first_name: 'juhi',
                last_name: 'modi',
                email: 'juhi@admin.com',
                is_admin: 'admin',
                mobile_no: '3451234567',
                role_id: roleData._id,
                password: passwordhash,
                is_superadmin: 'yes',
                is_active: true,
                createdAt: new Date(),
                updated_at: new Date(),
            }]);
    }
    return;
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
