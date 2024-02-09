"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const moment = require("moment");
// const spawn = require("child_process").spawn;
const nodemailer = require("nodemailer");
const path = require("path");
const log4js = require("log4js");
const logger = log4js.getLogger();
const admin_token_model_1 = __importDefault(require("../../models/admin-token-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const service_request_model_1 = __importDefault(require("../../models/service-request-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const firebase_1 = __importDefault(require("../../helper/firebase"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const bid_request_model_1 = __importDefault(require("../../models/bid-request-model"));
var backup = require('mongodb-backup');
const { exec } = require('child_process');
const archiver = require('archiver');
const dbBackup = async () => {
    try {
        await backup({
            uri: 'mongodb+srv://juhi:GyfK4mJ7b6vIRxC5@cluster0.2b6leht.mongodb.net/live-maintenance-master',
            root: __dirname,
            collections: ['admins'],
            tar: 'dump.tar',
            callback: function (err) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log('finish');
                }
            }
        });
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("dbBackup");
        logger.info(sendResponse);
    }
};
const destroyToken = async () => {
    try {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        await admin_token_model_1.default.deleteMany({
            createdAt: { $lte: date },
        });
        await user_token_model_1.default.deleteMany({
            createdAt: { $lte: date },
        });
        return;
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("destroyToken");
        logger.info(sendResponse);
    }
};
const removeLogger = async () => {
    try {
        var uploadsDir = __dirname + "/logger";
        fs.rmdir(uploadsDir, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            console.log(`${uploadsDir} is deleted!`);
        });
        return;
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("removeLogger");
        logger.info(sendResponse);
    }
};
const serviceComplete = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() + 10));
        const ServiceData = await service_request_model_1.default.find({
            complishment_report: { $exists: true },
            status: "rewarded",
            complishment_report_date: {
                $gte: new Date(dateValue.setUTCHours(0o0, 0o0, 0o0)),
                $lte: new Date(dateValue.setUTCHours(23, 59, 59, 999)),
            },
        });
        ServiceData.map(async function (service) {
            await service_request_model_1.default.findByIdAndUpdate(service._id, {
                status: "completed",
            });
        });
    }
    catch (err) {
        console.log(err.message);
    }
};
const autoCancelledAfter12Month = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 365));
        const ServiceData = await service_request_model_1.default.find({
            "status": 8,
            "createdAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        await Promise.all(ServiceData.map(async function (serviceItem) {
            await service_request_model_1.default.findByIdAndUpdate(serviceItem._id, {
                status: 9,
            });
            const bidData = await bid_request_model_1.default.findById(serviceItem.selected_bid_id);
            if (serviceItem && bidData) {
                let pushTitle = 'The service request not do any event';
                let message = `Service Request is Cancel (Request Id: ${serviceItem.request_id})`;
                let payload = serviceItem;
                await notification_model_1.default.create({
                    user_id: [serviceItem?.user_id, bidData.vendor_id],
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                });
                const userNotification = await user_model_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(serviceItem.user_id)
                });
                let getTokenCustomer = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(serviceItem.user_id),
                    firebase_token: { $ne: null }
                })).map(value => value.firebase_token);
                let getTokenVendor = (await user_token_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(bidData.vendor_id)
                })).map(value => value.firebase_token);
                let getToken = getTokenCustomer.concat(getTokenVendor);
                if (userNotification && userNotification.firebase_is_active) {
                    try {
                        let dataStore = getToken;
                        let notificationData = {
                            "type": 1,
                            "title": pushTitle,
                            "message": message,
                            "extraData": JSON.stringify(payload),
                            "updatedAt": new Date().toString(),
                        };
                        let fcmData = {
                            "subject": pushTitle,
                            "content": message,
                            "data": notificationData,
                            "image": ""
                        };
                        let token = dataStore;
                        await firebase_1.default.sendPushNotification(token, fcmData);
                    }
                    catch (err) {
                        logger.info("sendPushNotification");
                        logger.info(err);
                    }
                }
            }
        }));
    }
    catch (err) {
        console.log(err.message);
    }
};
const serviceAutoClose = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 15));
        const ServiceData = await service_request_model_1.default.find({
            "status": 2,
            "createdAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        ServiceData.map(async function (serviceItem) {
            await service_request_model_1.default.findByIdAndUpdate(serviceItem._id, {
                status: 4,
            });
        });
    }
    catch (err) {
        console.log(err.message);
    }
};
const serviceAutoCancelAfter30Day = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 30));
        const ServiceData = await service_request_model_1.default.find({
            "status": 6,
            "updatedAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        ServiceData.map(async function (serviceItem) {
            await service_request_model_1.default.findByIdAndUpdate(serviceItem._id, {
                status: 9,
            });
        });
    }
    catch (err) {
        console.log(err.message);
    }
};
const BidModalUpdate = async () => {
    try {
        // Update the createdAt field for all records in the BidModal schema
        await bid_request_model_1.default.updateMany({}, { $set: { validity: "2023/05/31" } });
        console.log('All records updated successfully!');
    }
    catch (error) {
        console.error('Error updating records:', error);
    }
};
const databaseBackup = async () => {
    const mongodbUri = process.env.MONGO_URI;
    const backupPath = `${process.cwd() + '/src/database/'}`;
    const currentDate = moment().format("MM-DD-YYYY--HH-mm-ss-a");
    const backupFile = `backup-${currentDate}.zip`;
    const cmd = `mongodump --uri=${mongodbUri} --out=${backupPath} && zip -r ${backupFile} ${backupPath}`;
    exec(cmd, async (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
    try {
        const output = fs.createWriteStream(backupPath + backupFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // compression level
        });
        archive.directory(backupPath + 'live-maintenance-master', false);
        await sendEmailDatabase(backupFile, backupPath);
        output.on('close', async () => {
            console.log('Zip file created successfully!');
        });
        archive.pipe(output);
        archive.finalize();
    }
    catch (error) {
        console.log('errrr', error);
    }
};
const sendEmailDatabase = async (backupFiles, backupPaths) => {
    let backupFile = backupFiles;
    let backupPath = backupPaths;
    let template = 'database';
    let sendData = {
        to: 'maintenance.master.app@gmail.com',
        subject: 'database backup',
        template: template,
        sendEmailTemplatedata: {
            app_name: process.env.APP_NAME,
            attachment: backupPath + backupFile,
            filename: "Database"
        },
        attachments: {
            filename: backupFile,
            path: backupPath + backupFile,
        }
    };
    await commonFunction_1.default.sendEmailTemplate(sendData);
};
const randomDataUpdate = async () => {
    try {
        // const ServiceData = await BidModel.find({
        //     // validity: "Invalid date"
        // });
        // // console.log(ServiceData)
        // ServiceData.map(async function (serviceItem) {
        //     await BidModel.updateOne({ _id: serviceItem._id }, { $set: { is_active: true } });
        //     //     await BidModel.findByIdAndUpdate(serviceItem._id, {
        //     //         validity: '2023/05/31',
        //     //     });
        // });
        // console.log("done sr date ")
    }
    catch (err) {
        console.log(err.message);
    }
};
exports.default = {
    destroyToken,
    removeLogger,
    dbBackup,
    serviceAutoClose,
    serviceComplete,
    autoCancelledAfter12Month,
    databaseBackup,
    sendEmailDatabase,
    randomDataUpdate,
    BidModalUpdate,
    serviceAutoCancelAfter30Day
};
