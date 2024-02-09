"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const common_router_1 = __importDefault(require("./common-router"));
const user_router_1 = __importDefault(require("./user-router"));
const admin_router_1 = __importDefault(require("./admin-router"));
const no_auth_router_1 = __importDefault(require("./no-auth-router"));
const common_1 = __importDefault(require("../controllers/common/common"));
const multer_1 = __importDefault(require("multer"));
// Export the base-router
const baseRouter = (0, express_1.Router)();
// Setup routers
const upload = (0, multer_1.default)({ dest: "uploads/" });
baseRouter.post('/common/upload_image_multi', upload.array('files'), [common_1.default.uploadImageMulti]);
baseRouter.post('/common/upload_image', upload.array('files'), [common_1.default.uploadImage]);
baseRouter.post('/common/upload_video', upload.array('files'), [common_1.default.uploadVideo]);
baseRouter.post('/common/upload_file', upload.array('files'), [common_1.default.uploadFiles]);
baseRouter.use('/', no_auth_router_1.default);
baseRouter.use('/common', common_router_1.default);
baseRouter.use('/user', user_router_1.default);
baseRouter.use('/admin', admin_router_1.default);
// Export default.
exports.default = baseRouter;
