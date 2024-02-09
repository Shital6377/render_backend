'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' });
const our_contact_us_model_1 = __importDefault(require("../models/our-contact-us-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const contactUsData = [
    {
        key: 'email',
        value: 'maintenance.master.user@gmail.com'
    },
    {
        key: 'contact_no',
        value: '+971501116173'
    },
    {
        key: 'location',
        value: '{"address":"101, Causeway Rd, River Park Society, Singanpor, Surat, Gujarat 395004, India","latitude":21.224911,"longitude":72.8073869}'
    },
    {
        key: 'website',
        value: 'http://34.235.150.200/home'
    },
    {
        key: 'admin_email',
        value: 'maintance.master.app@gmail.com'
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await our_contact_us_model_1.default.deleteMany({});
        await our_contact_us_model_1.default.create(contactUsData);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
