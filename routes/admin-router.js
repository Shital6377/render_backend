"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_guard_1 = require("../middleware/admin-guard");
const decryptData_1 = __importDefault(require("../helper/decryptData"));
const auth_1 = __importDefault(require("../controllers/admin/auth"));
const common_validation_1 = __importDefault(require("../validation/common-validation"));
const category_1 = __importDefault(require("../controllers/admin/category"));
const category_validation_1 = __importDefault(require("../validation/admin/category-validation"));
const user_1 = __importDefault(require("../controllers/admin/user"));
const user_validation_1 = __importDefault(require("../validation/admin/user-validation"));
const userAsset_1 = __importDefault(require("../controllers/admin/userAsset"));
const post_1 = __importDefault(require("../controllers/admin/post"));
const post_validation_1 = __importDefault(require("../validation/admin/post-validation"));
const serviceRequest_1 = __importDefault(require("../controllers/admin/serviceRequest"));
const serviceRequest_validation_1 = __importDefault(require("../validation/admin/serviceRequest-validation"));
const faq_1 = __importDefault(require("../controllers/admin/faq"));
const faq_validation_1 = __importDefault(require("../validation/admin/faq-validation"));
const setting_1 = __importDefault(require("../controllers/admin/setting"));
const setting_validation_1 = __importDefault(require("../validation/admin/setting-validation"));
const cms_1 = __importDefault(require("../controllers/admin/cms"));
const cms_validation_1 = __importDefault(require("../validation/admin/cms-validation"));
const ourContactUs_1 = __importDefault(require("../controllers/admin/ourContactUs"));
const ourContactUs_validation_1 = __importDefault(require("../validation/admin/ourContactUs-validation"));
const contactUs_1 = __importDefault(require("../controllers/admin/contactUs"));
const contactUs_validation_1 = __importDefault(require("../validation/admin/contactUs-validation"));
const socialMedia_1 = __importDefault(require("../controllers/admin/socialMedia"));
const socialMedia_validation_1 = __importDefault(require("../validation/admin/socialMedia-validation"));
const trainingMaterial_1 = __importDefault(require("../controllers/admin/trainingMaterial"));
const trainingMaterial_validation_1 = __importDefault(require("../validation/admin/trainingMaterial-validation"));
const serviceType_1 = __importDefault(require("../controllers/admin/serviceType"));
const serviceType_validation_1 = __importDefault(require("../validation/admin/serviceType-validation"));
const categoriesDispute_1 = __importDefault(require("../controllers/admin/categoriesDispute"));
const categoriesDispute_validation_1 = __importDefault(require("../validation/admin/categoriesDispute-validation"));
const assets_1 = __importDefault(require("../controllers/admin/assets"));
const assets_validation_1 = __importDefault(require("../validation/admin/assets-validation"));
const visitSite_1 = __importDefault(require("../controllers/admin/visitSite"));
const visitSite_validation_1 = __importDefault(require("../validation/admin/visitSite-validation"));
const bidRequest_1 = __importDefault(require("../controllers/admin/bidRequest"));
const cancelReason_1 = __importDefault(require("../controllers/admin/cancelReason"));
const cancelReason_validation_1 = __importDefault(require("../validation/admin/cancelReason-validation"));
const user_2 = __importDefault(require("../controllers/admin/user"));
const suggestions_1 = __importDefault(require("../controllers/admin/suggestions"));
const reportRequest_1 = __importDefault(require("../controllers/admin/reportRequest"));
const reviews_1 = __importDefault(require("../controllers/user/reviews"));
const CommissionHistory_1 = __importDefault(require("../controllers/admin/CommissionHistory"));
const paymentTransaction_1 = __importDefault(require("../controllers/admin/paymentTransaction"));
const earning_1 = __importDefault(require("../controllers/admin/earning"));
const myServices_1 = __importDefault(require("../controllers/admin/myServices"));
const whyMaintenance_1 = __importDefault(require("../controllers/admin/whyMaintenance"));
const whyMaintenance_validation_1 = __importDefault(require("../validation/admin/whyMaintenance-validation"));
const sensor_1 = __importDefault(require("../controllers/user/sensor"));
// Constants
const adminRouter = (0, express_1.Router)();
adminRouter.use(decryptData_1.default.DecryptedData);
adminRouter.use(admin_guard_1.authAdmin);
adminRouter.get("/dashboard", auth_1.default.dashboard);
adminRouter.post("/change-password", auth_1.default.changePassword);
adminRouter.post("/logout", auth_1.default.logout);
adminRouter.post("/profile-update", auth_1.default.updateProfile);
adminRouter.get("/profile", auth_1.default.getProfile);
// *******************************************************************************************
// ================================== Start Setting  Route =======================================
// *******************************************************************************************
adminRouter.get("/setting/get", setting_1.default.get);
adminRouter.post("/setting/store", setting_validation_1.default.store, setting_1.default.store);
adminRouter.get("/setting/edit-get", common_validation_1.default.idRequiredQuery, setting_1.default.edit);
adminRouter.delete("/setting/delete", common_validation_1.default.idRequiredQuery, setting_1.default.destroy);
adminRouter.post("/setting/change-status", common_validation_1.default.idRequired, setting_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Setting  Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Socila Media  Route =======================================
// *******************************************************************************************
adminRouter.get("/social-media/get", socialMedia_1.default.get);
adminRouter.post("/social-media/store", socialMedia_validation_1.default.store, socialMedia_1.default.store);
adminRouter.get("/social-media/edit-get", common_validation_1.default.idRequiredQuery, socialMedia_1.default.edit);
adminRouter.delete("/social-media/delete", common_validation_1.default.idRequiredQuery, socialMedia_1.default.destroy);
adminRouter.post("/social-media/change-status", common_validation_1.default.idRequired, socialMedia_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Socila Media  Route =========================================
// *******************************************************************************************
//why maintenance master
adminRouter.get("/why-maintenance-master/get", whyMaintenance_1.default.get);
adminRouter.post("/why-maintenance-master/store", whyMaintenance_validation_1.default.store, whyMaintenance_1.default.store);
adminRouter.get("/why-maintenance-master/edit-get", common_validation_1.default.idRequiredQuery, whyMaintenance_1.default.edit);
adminRouter.delete("/why-maintenance-master/delete", common_validation_1.default.idRequiredQuery, whyMaintenance_1.default.destroy);
// adminRouter.post("/why-maintenance-master/change-status", commonValidation.idRequired, whyMaintenance.changeStatus);
//end
// *******************************************************************************************
// ================================== Start Faqs Route =======================================
// *******************************************************************************************
adminRouter.get("/categories-dispute/get", categoriesDispute_1.default.get);
adminRouter.post("/categories-dispute/store", categoriesDispute_validation_1.default.store, categoriesDispute_1.default.store);
adminRouter.get("/categories-dispute/edit-get", common_validation_1.default.idRequiredQuery, categoriesDispute_1.default.edit);
adminRouter.delete("/categories-dispute/delete", common_validation_1.default.idRequiredQuery, categoriesDispute_1.default.destroy);
adminRouter.post("/categories-dispute/change-status", common_validation_1.default.idRequired, categoriesDispute_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Faqs Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Faqs Route =======================================
// *******************************************************************************************
adminRouter.get("/faq/get", faq_1.default.get);
adminRouter.post("/faq/store", faq_validation_1.default.store, faq_1.default.store);
adminRouter.get("/faq/edit-get", common_validation_1.default.idRequiredQuery, faq_1.default.edit);
adminRouter.delete("/faq/delete", common_validation_1.default.idRequiredQuery, faq_1.default.destroy);
adminRouter.post("/faq/change-status", common_validation_1.default.idRequired, faq_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Faqs Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start cancel Reason Route =======================================
// *******************************************************************************************
adminRouter.get("/cancel-reason/get", cancelReason_1.default.get);
adminRouter.post("/cancel-reason/store", cancelReason_validation_1.default.store, cancelReason_1.default.store);
adminRouter.get("/cancel-reason/edit-get", common_validation_1.default.idRequiredQuery, cancelReason_1.default.edit);
adminRouter.delete("/cancel-reason/delete", common_validation_1.default.idRequiredQuery, cancelReason_1.default.destroy);
adminRouter.post("/cancel-reason/change-status", common_validation_1.default.idRequired, cancelReason_1.default.changeStatus);
// *******************************************************************************************
// ================================== End cancel Reason Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start service Type Route =======================================
// *******************************************************************************************
adminRouter.get("/service-type/get", serviceType_1.default.get);
adminRouter.post("/service-type/store", serviceType_validation_1.default.store, serviceType_1.default.store);
adminRouter.get("/service-type/edit-get", common_validation_1.default.idRequiredQuery, serviceType_1.default.edit);
adminRouter.delete("/service-type/delete", common_validation_1.default.idRequiredQuery, serviceType_1.default.destroy);
adminRouter.post("/service-type/change-status", common_validation_1.default.idRequired, serviceType_1.default.changeStatus);
// *******************************************************************************************
// ================================== End service Type Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start assets Route =======================================
// *******************************************************************************************
adminRouter.get("/assets/get", assets_1.default.get);
adminRouter.post("/assets/store", assets_validation_1.default.store, assets_1.default.store);
adminRouter.get("/assets/edit-get", common_validation_1.default.idRequiredQuery, assets_1.default.edit);
adminRouter.delete("/assets/delete", common_validation_1.default.idRequiredQuery, assets_1.default.destroy);
adminRouter.post("/assets/change-status", common_validation_1.default.idRequired, assets_1.default.changeStatus);
// *******************************************************************************************
// ================================== End service-request Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start service-request Route =======================================
// *******************************************************************************************
adminRouter.get("/service-request/get", serviceRequest_1.default.get);
adminRouter.post("/service-request/store", serviceRequest_validation_1.default.store, serviceRequest_1.default.store);
adminRouter.get("/service-request/edit-get", common_validation_1.default.idRequiredQuery, serviceRequest_1.default.edit);
adminRouter.delete("/service-request/delete", common_validation_1.default.idRequiredQuery, serviceRequest_1.default.destroy);
adminRouter.post("/service-request/change-status", common_validation_1.default.idRequired, serviceRequest_1.default.changeStatus);
adminRouter.post("/service-request/close-admin", common_validation_1.default.idRequired, serviceRequest_1.default.closeByAdmin);
// *******************************************************************************************
// ================================== End service-request Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start category Route =======================================
// *******************************************************************************************
adminRouter.get("/category/get", category_1.default.get);
adminRouter.post("/category/store", category_validation_1.default.store, category_1.default.store);
adminRouter.get("/category/edit-get", common_validation_1.default.idRequiredQuery, category_1.default.edit);
adminRouter.delete("/category/delete", common_validation_1.default.idRequiredQuery, category_1.default.destroy);
adminRouter.post("/category/change-status", common_validation_1.default.idRequired, category_1.default.changeStatus);
// *******************************************************************************************
// ================================== End category Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start user Route =======================================
// *******************************************************************************************
adminRouter.get("/user/getAll", user_1.default.getAll);
adminRouter.get("/user/export", user_1.default.exportUser);
adminRouter.get("/user/get", user_1.default.get);
adminRouter.post("/user/store", user_validation_1.default.store, user_1.default.store);
adminRouter.get("/user/edit-get", common_validation_1.default.idRequiredQuery, user_1.default.edit);
adminRouter.delete("/user/delete", common_validation_1.default.idRequiredQuery, user_1.default.destroy);
adminRouter.post("/user/change-status", common_validation_1.default.idRequired, user_1.default.changeStatus);
adminRouter.post("/user/change-status-firebase", common_validation_1.default.idRequired, user_1.default.changeStatusFirebase);
adminRouter.post("/user/change-status-email", common_validation_1.default.idRequired, user_1.default.changeStatusEmail);
adminRouter.get("/user-asset/get", userAsset_1.default.get);
adminRouter.post("/user-asset/store", userAsset_1.default.store); // validation : userAssetValidation.store,
adminRouter.get("/user-asset/edit-get", common_validation_1.default.idRequiredQuery, userAsset_1.default.edit);
adminRouter.delete("/user-asset/delete", common_validation_1.default.idRequiredQuery, userAsset_1.default.destroy);
adminRouter.post("/user-asset/change-status", common_validation_1.default.idRequired, userAsset_1.default.changeStatus);
adminRouter.get("/visit-site/get", visitSite_1.default.get);
adminRouter.post("/visit-site/store", visitSite_validation_1.default.store, visitSite_1.default.store);
adminRouter.get("/visit-site/edit-get", common_validation_1.default.idRequiredQuery, visitSite_1.default.edit);
adminRouter.delete("/visit-site/delete", common_validation_1.default.idRequiredQuery, visitSite_1.default.destroy);
adminRouter.post("/visit-site/change-status", common_validation_1.default.idRequired, visitSite_1.default.changeStatus);
// user
adminRouter.post("/user/changeUserPassword", user_validation_1.default.changePasswordValidation, user_2.default.changeUserPassword);
adminRouter.post("/user/notification", user_2.default.sendNotification);
// *******************************************************************************************
// ================================== End user Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Sub-Admin-Request Route =======================================
// *******************************************************************************************
adminRouter.post("/sub-admin/store", user_validation_1.default.store, user_1.default.store);
// *******************************************************************************************
// ================================== End Sub-Admin-Request Route =======================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start post Route =======================================
// *******************************************************************************************
adminRouter.get("/post/get", post_1.default.get);
adminRouter.get("/post/get-comment", post_1.default.getComment);
adminRouter.post("/post/store", post_validation_1.default.store, post_1.default.store);
adminRouter.get("/post/edit-get", common_validation_1.default.idRequiredQuery, post_1.default.edit);
adminRouter.delete("/post/delete", common_validation_1.default.idRequiredQuery, post_1.default.destroy);
adminRouter.post("/post/change-status", common_validation_1.default.idRequired, post_1.default.changeStatus);
adminRouter.delete("/post/delete-comment", common_validation_1.default.idRequiredQuery, post_1.default.deletePostComment);
// *******************************************************************************************
// ================================== End user Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start setting Route =======================================
// *******************************************************************************************
adminRouter.get("/setting/get", setting_1.default.get);
adminRouter.post("/setting/store", setting_validation_1.default.store, setting_1.default.store);
// *******************************************************************************************
// ================================== End setting Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************
adminRouter.get("/cms/get", cms_1.default.get);
adminRouter.post("/cms/store", cms_validation_1.default.store, cms_1.default.store);
// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************
adminRouter.get("/our-contact-us/get", ourContactUs_1.default.get);
adminRouter.post("/our-contact-us/store", ourContactUs_validation_1.default.store, ourContactUs_1.default.store);
// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************
// adminRouter.get("/cms/get", cmsService.get);
// adminRouter.post("/cms/store", cmsValidation.store, cmsService.store);
// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start contact_us Route =======================================
// *******************************************************************************************
adminRouter.get("/contact-us/get", contactUs_1.default.get);
adminRouter.post("/contact-us/store", contactUs_validation_1.default.store, contactUs_1.default.store);
adminRouter.get("/contact-us/edit-get", common_validation_1.default.idRequiredQuery, contactUs_1.default.edit);
adminRouter.delete("/contact-us/delete", common_validation_1.default.idRequiredQuery, contactUs_1.default.destroy);
adminRouter.post("/contact-us/change-status", common_validation_1.default.idRequired, contactUs_1.default.changeStatus);
// *******************************************************************************************
// ================================== End contact_us Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start training-material Route =======================================
// *******************************************************************************************
adminRouter.get("/training-material/get", trainingMaterial_1.default.get);
adminRouter.post("/training-material/store", trainingMaterial_validation_1.default.store, trainingMaterial_1.default.store);
adminRouter.get("/training-material/edit-get", common_validation_1.default.idRequiredQuery, trainingMaterial_1.default.edit);
adminRouter.delete("/training-material/delete", common_validation_1.default.idRequiredQuery, trainingMaterial_1.default.destroy);
adminRouter.post("/training-material/change-status", common_validation_1.default.idRequired, trainingMaterial_1.default.changeStatus);
// *******************************************************************************************
// ================================== End training-material Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Bid-Request Route =======================================
// *******************************************************************************************
adminRouter.get("/bids/by-service_request_id", bidRequest_1.default.getByServiceReqId); //a
adminRouter.get("/bid/detail-get", bidRequest_1.default.bidDetailView); //a
// *******************************************************************************************
// ================================== End Bid-Request Route =======================================
// *******************************************************************************************
//Suggestion
adminRouter.get("/suggestions/get", suggestions_1.default.get);
// report user
adminRouter.get("/report-request/get", reportRequest_1.default.get);
adminRouter.post("/report-request/edit", reportRequest_1.default.editStatus);
adminRouter.delete("/report-request/delete", common_validation_1.default.idRequiredQuery, reportRequest_1.default.destroy);
adminRouter.post("/get-reviews", reviews_1.default.getByVendorId);
// provider commission 
adminRouter.post("/commission-history", CommissionHistory_1.default.store);
adminRouter.get("/commission-history/get", CommissionHistory_1.default.getCommissionHistory);
adminRouter.get("/payment-transaction", paymentTransaction_1.default.get);
// my earning
adminRouter.get("/my-earning/get", earning_1.default.get);
adminRouter.get("/my-services/get", myServices_1.default.get);
// sensor data get
adminRouter.get("/location", sensor_1.default.get);
adminRouter.get("/sensordata", sensor_1.default.getWithPagination);
// Export default
exports.default = adminRouter;
