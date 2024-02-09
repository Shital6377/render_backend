"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const common_1 = __importDefault(require("../controllers/common/common"));
const decryptData_1 = __importDefault(require("../helper/decryptData"));
// Constants
const commonRouter = (0, express_1.Router)();
commonRouter.use(decryptData_1.default.DecryptedData);
commonRouter.get('/category', common_1.default.getCategory);
commonRouter.post('/post-like-unlike', common_1.default.storePostLike);
commonRouter.post('/post-comment', common_1.default.storePostComment);
commonRouter.post('/post-comment-get', common_1.default.getPostComment);
commonRouter.post('/recent-post-get', common_1.default.getRecentPost);
commonRouter.get('/categories-dispute', common_1.default.getCategoriesDispute);
commonRouter.post('/service-type-active', common_1.default.getServiceType);
commonRouter.post('/assets-active', common_1.default.getAssets);
commonRouter.post('/cancel-reason-active', common_1.default.getCancelReason);
commonRouter.post('/admin-active', common_1.default.GetActiveAdmin);
commonRouter.post('/vendor-active', common_1.default.GetActiveVendor);
commonRouter.post('/customer-active', common_1.default.GetActiveCustomer);
commonRouter.get("/asset-category-get", common_1.default.getAssetsCategory);
commonRouter.get("/asset-uses-get", common_1.default.getUses);
commonRouter.get("/asset-structure-type-get", common_1.default.getStructureType);
commonRouter.get("/asset-facade-type-get", common_1.default.getFacadeType);
commonRouter.get("/social-media-get", common_1.default.getSocialMedia);
commonRouter.post("/priority-get", common_1.default.getPriority);
commonRouter.post("/our-contact-us-get", common_1.default.getOurContactUs);
commonRouter.get("/service-request/get-update-dispute", common_1.default.getDisputeDetails);
commonRouter.post("/service-request/update-dispute", common_1.default.updateDispute);
commonRouter.get("/why-maintenance-master/get", common_1.default.getWhyMaintenance);
// Export default
exports.default = commonRouter;
