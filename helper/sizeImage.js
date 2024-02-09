"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonReSizeImage = exports.reSizeImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const reSizeImage = async (blob, width, height) => {
    const comparessedImage = (0, sharp_1.default)(blob).resize({
        width: width,
        height: height
    }).toBuffer();
    return comparessedImage;
};
exports.reSizeImage = reSizeImage;
const nonReSizeImage = async (blob) => {
    const comparessedImage = (0, sharp_1.default)(blob).resize().toBuffer();
    return comparessedImage;
};
exports.nonReSizeImage = nonReSizeImage;
