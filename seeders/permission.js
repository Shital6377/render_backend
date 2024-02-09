'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const permission_model_1 = __importDefault(require("../models/permission-model"));
const mongoose_1 = __importDefault(require("mongoose"));
var create = '_create';
var store = '_store';
var view = '_view';
var edit = '_edit';
var delete_tag = '_delete';
var active_inactive = '_active_inactive';
let modelNameArray = ['subadmin', 'faq'];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        let dataColletion = [];
        modelNameArray.map((modelName, ii) => {
            dataColletion.push({
                position: 0,
                name: modelName,
                parent: modelName,
            }, {
                position: 1,
                name: modelName + view,
                parent: modelName,
            }, {
                position: 2,
                name: modelName + create,
                parent: modelName,
            }, {
                position: 3,
                name: modelName + store,
                parent: modelName,
            }, {
                position: 4,
                name: modelName + edit,
                parent: modelName,
            }, {
                position: 5,
                name: modelName + active_inactive,
                parent: modelName,
            }, {
                position: 6,
                name: modelName + delete_tag,
                parent: modelName,
            });
        });
        let PerData = [];
        await dataColletion.forEach((element, indexx) => {
            let moduleName = element.name.replace('_', ' ');
            // moduleName = moduleName.charAt(0).toUpperCase();
            const str = moduleName;
            //split the above string into an array of strings
            //whenever a blank space is encountered
            const dataColletion = str.split(" ");
            //loop through each element of the array and capitalize the first letter.
            for (var i = 0; i < dataColletion.length; i++) {
                dataColletion[i] = dataColletion[i].charAt(0).toUpperCase() + dataColletion[i].slice(1);
            }
            //Join all the elements of the array back into a string
            //using a blankspace as a separator
            const str2 = dataColletion.join(" ");
            PerData.push({
                name: element.name,
                position: element.position,
                parent: element.parent,
                module: str2,
                guard_name: element.name == "subadmin_view" ? "admins || sub-admin" : "admins",
                createdAt: new Date(),
                updated_at: new Date(),
            });
        });
        PerData.push({
            name: "notification",
            position: PerData.length + 1,
            parent: "notification",
            module: "notification",
            guard_name: "sub-admin",
            createdAt: new Date(),
            updated_at: new Date(),
        });
        await permission_model_1.default.deleteMany({});
        await permission_model_1.default.create(PerData);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
