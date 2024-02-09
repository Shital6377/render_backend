"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const decryptData_1 = __importDefault(require("../helper/decryptData"));
const auth_validation_1 = __importDefault(require("../validation/user/auth-validation"));
const common_validation_1 = __importDefault(require("../validation/common-validation"));
const setting_1 = __importDefault(require("../controllers/admin/setting"));
const auth_1 = __importDefault(require("../controllers/admin/auth"));
const auth_2 = __importDefault(require("../controllers/user/auth"));
const common_1 = __importDefault(require("../controllers/common/common"));
const auth_validation_2 = __importDefault(require("../validation/admin/auth-validation"));
const auth_validation_3 = __importDefault(require("../validation/user/auth-validation"));
const contactUs_validation_1 = __importDefault(require("../validation/user/contactUs-validation"));
const suggestion_validation_1 = __importDefault(require("../validation/user/suggestion-validation"));
const serviceRequest_validation_1 = __importDefault(require("../validation/user/serviceRequest-validation"));
const serviceRequest_1 = __importDefault(require("../controllers/user/serviceRequest"));
const trainingMaterial_1 = __importDefault(require("../controllers/user/trainingMaterial"));
const sensor_1 = __importDefault(require("../controllers/user/sensor"));
// Constants
const noAuthRouter = (0, express_1.Router)();
noAuthRouter.use(decryptData_1.default.DecryptedData);
noAuthRouter.post("/admin/login", auth_validation_2.default.login, auth_1.default.login);
noAuthRouter.post("/admin/forget-password", auth_validation_2.default.emailValidation, auth_1.default.forgetPassword);
noAuthRouter.post("/admin/reset-password", auth_validation_2.default.resetPassword, auth_1.default.resetPassword);
// Customer NOAuth Route Start
noAuthRouter.post("/user/login", auth_validation_1.default.login, auth_2.default.login);
noAuthRouter.post("/user/register", auth_validation_1.default.register, auth_2.default.register);
// noAuthRouter.post("/user/register",authCustomerService.register);
noAuthRouter.post("/user/forget-password", auth_validation_3.default.emailValidation, auth_2.default.forgetPassword);
noAuthRouter.post("/user/reset-password", auth_validation_3.default.resetPassword, auth_2.default.resetPassword);
noAuthRouter.post("/user/verify-phone", auth_validation_3.default.verifyMobileNumber, auth_2.default.mobileVerification);
// Common
noAuthRouter.get("/setting/get", setting_1.default.get);
noAuthRouter.post("/verify-otp", auth_validation_3.default.verifyOtp, common_1.default.otpVerification);
noAuthRouter.post("/chat-store", common_validation_1.default.storeChat, common_1.default.storeChat);
noAuthRouter.post("/chat-get", common_1.default.getChat);
noAuthRouter.get("/get-our-services", common_1.default.getOurServices);
noAuthRouter.get("/faq-get", common_1.default.getFaq);
noAuthRouter.post("/post-get", common_1.default.getPost);
noAuthRouter.post("/post-detail", common_1.default.getPostDetail);
noAuthRouter.get("/post/check-islike", common_1.default.getCheckIsLikePost);
noAuthRouter.post("/post-store", common_1.default.storePost);
noAuthRouter.post("/contact-us", contactUs_validation_1.default.store, common_1.default.storeContactUs);
noAuthRouter.post("/suggestion", suggestion_validation_1.default.store, common_1.default.storeSuggestion);
noAuthRouter.get("/cms", common_1.default.getCms);
noAuthRouter.post("/mobile-post-get", common_1.default.getPostMobile);
noAuthRouter.get("/service-request-report", serviceRequest_validation_1.default.getBySlug, serviceRequest_1.default.getReport);
//email checking api 
noAuthRouter.post("/check-field", common_validation_1.default.fieldExistValidation, common_1.default.checkDataField);
noAuthRouter.get("/training-material/get", trainingMaterial_1.default.get);
// sensor api
noAuthRouter.post('/add-sensor-data', sensor_1.default.store);
noAuthRouter.post('/get-sensor', sensor_1.default.getSensorData);
noAuthRouter.delete('/sensor/delete', sensor_1.default.destroy);
// Export default
exports.default = noAuthRouter;
