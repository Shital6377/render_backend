"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config = new aws_sdk_1.default.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    signatureVersion: "v4",
});
const s3 = new aws_sdk_1.default.S3();
const uploadImageToS3 = async (filename, blob) => {
    let uploadedImage = null;
    if (process.env.AWS_S3_BUCKET_NAME) {
        uploadedImage = await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: blob,
        }).promise();
    }
    return uploadedImage;
};
const uploadFileToS3 = async (filename, blob) => {
    let uploadedImage = null;
    if (process.env.AWS_S3_BUCKET_NAME) {
        uploadedImage = await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: blob,
        }).promise();
    }
    return uploadedImage;
};
exports.default = {
    uploadImageToS3,
    uploadFileToS3
};
