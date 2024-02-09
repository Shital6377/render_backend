"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// import { initializeApp } from 'firebase-admin/app';
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
var serviceAccount = require('../quakemeup-b5167-firebase-adminsdk-36tlj-cafc8474f6.json');
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
const sendPushNotification = async (token, obj) => {
    if (token.length) {
        let dataSend = {
            "title": obj.title,
            "message": obj.notification_body
        };
        await firebase_admin_1.default.messaging().sendMulticast({
            data: dataSend,
            notification: {
                title: obj.title,
                body: obj.notification_body
            },
            tokens: token
        }).then((value) => {
            console.log('Successfully sent message:', value);
            console.log(value.responses);
            logger.info("Admin :: Successfully sent message Issue");
            logger.info(value.responses);
        }).catch((error) => {
            console.log('Error sending message:', error);
            throw error;
        });
    }
    else {
        console.log('null pass token on');
        logger.info("null pass token on");
    }
};
exports.sendPushNotification = sendPushNotification;
exports.default = {
    sendPushNotification: exports.sendPushNotification,
};
