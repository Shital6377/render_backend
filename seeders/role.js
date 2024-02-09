'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const mongoose_1 = __importDefault(require("mongoose"));
const permission_model_1 = __importDefault(require("../models/permission-model"));
const role_model_1 = __importDefault(require("../models/role-model"));
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        var Permissions_data = await permission_model_1.default.find();
        var perArray = new Array();
        var subPerArray = new Array();
        Permissions_data.forEach((element) => {
            perArray.push(element.name);
            if (element.name == "subadmin_view" || element.name == "notification") {
                subPerArray.push(element.name);
            }
        });
        var roleArray = [
            {
                name: 'super_admin',
                permission_name: JSON.stringify(perArray),
                guard_name: 'admins',
                createdAt: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'admin',
                permission_name: JSON.stringify(subPerArray),
                guard_name: 'sub_admins',
                createdAt: new Date(),
                updated_at: new Date(),
            }
        ];
        await role_model_1.default.deleteMany({});
        await role_model_1.default.create(roleArray);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
