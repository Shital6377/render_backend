"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_guard_1 = require("../middleware/user-guard");
const decryptData_1 = __importDefault(require("../helper/decryptData"));
const common_validation_1 = __importDefault(require("../validation/common-validation"));
const auth_1 = __importDefault(require("../controllers/user/auth"));
const myAssets_1 = __importDefault(require("../controllers/user/myAssets"));
const serviceRequest_1 = __importDefault(require("../controllers/user/serviceRequest"));
const bidRequest_1 = __importDefault(require("../controllers/user/bidRequest"));
const paymentMethods_1 = __importDefault(require("../controllers/user/paymentMethods"));
const visitRequest_1 = __importDefault(require("../controllers/user/visitRequest"));
const serviceRequest_validation_1 = __importDefault(require("../validation/user/serviceRequest-validation"));
const bid_validation_1 = __importDefault(require("../validation/user/bid-validation"));
const myAssets_validation_1 = __importDefault(require("../validation/user/myAssets-validation"));
const visitRequest_validation_1 = __importDefault(require("../validation/user/visitRequest-validation"));
const reviews_1 = __importDefault(require("../controllers/user/reviews"));
const auth_validation_1 = __importDefault(require("../validation/user/auth-validation"));
const card_validation_1 = __importDefault(require("../validation/user/card-validation"));
const reportRequest_1 = __importDefault(require("../controllers/user/reportRequest"));
const paymentTransaction_1 = __importDefault(require("../controllers/user/paymentTransaction"));
const reportRequest_validation_1 = __importDefault(require("../validation/user/reportRequest-validation"));
const myEarning_1 = __importDefault(require("../controllers/user/myEarning"));
const servicesType_1 = __importDefault(require("../controllers/user/servicesType"));
const myServices_1 = __importDefault(require("../controllers/user/myServices"));
const myServices_validation_1 = __importDefault(require("../validation/user/myServices-validation"));
const payment_validation_1 = __importDefault(require("../validation/user/payment-validation"));
// Constants
const customerRouter = (0, express_1.Router)();
customerRouter.use(decryptData_1.default.DecryptedData);
customerRouter.use(user_guard_1.authUser);
customerRouter.post("/change-password", auth_validation_1.default.changePassword, auth_1.default.changePassword);
customerRouter.post("/logout", auth_1.default.logout);
customerRouter.post("/profile-update", auth_validation_1.default.profile, auth_1.default.updateProfile);
customerRouter.post("/upload-brochure", auth_validation_1.default.uploadBrochure, auth_1.default.uploadBrochure);
customerRouter.get("/profile", auth_1.default.getProfile);
customerRouter.post("/notification", auth_1.default.getNotification);
customerRouter.delete("/notification", auth_1.default.clearNotification);
customerRouter.post("/selected-notification-remove", auth_1.default.clearSelectedNotification);
customerRouter.get("/notification/count", auth_1.default.getCountNotification);
customerRouter.get("/notification/read", auth_1.default.readNotification);
// Service Request
customerRouter.post("/service-request/get", serviceRequest_1.default.get);
customerRouter.post("/service-request", serviceRequest_validation_1.default.store, serviceRequest_1.default.store);
customerRouter.get("/service-request/get-by-id", serviceRequest_1.default.edit);
customerRouter.post("/service-request/complete", serviceRequest_validation_1.default.completed, serviceRequest_1.default.completed);
customerRouter.post("/service-request/close", serviceRequest_validation_1.default.closeRequest, serviceRequest_1.default.closeRequest);
customerRouter.post("/service-request/rate", serviceRequest_validation_1.default.RateToSp, serviceRequest_1.default.RateSP);
customerRouter.post("/service-request/dispute", serviceRequest_validation_1.default.raiseDisputeValidation, serviceRequest_1.default.riseDispute);
customerRouter.get("/service-request/report", common_validation_1.default.idRequiredQuery, serviceRequest_1.default.getComplishmentReport); //a
customerRouter.get("/service-request-slug", serviceRequest_validation_1.default.getBySlug, serviceRequest_1.default.getBySlug);
customerRouter.post("/service-request/bids", serviceRequest_validation_1.default.getByServiceReqId, bidRequest_1.default.getByServiceReqId);
customerRouter.get("/service-request/get-dispute", common_validation_1.default.idRequiredQuery, serviceRequest_1.default.getDisputeDetails);
customerRouter.post("/service-request/update-dispute", serviceRequest_validation_1.default.updateDispute, serviceRequest_1.default.updateDispute);
customerRouter.post("/service-request/accomplishment-report", serviceRequest_validation_1.default.complishmentReportValidation, serviceRequest_1.default.storeAccomplishementReport);
customerRouter.post("/service-request/dispute-admin-contact", serviceRequest_validation_1.default.disputeConatctAdmin, serviceRequest_1.default.disputeConatctAdmin);
//Visit Request
customerRouter.post("/site-visit-user", visitRequest_1.default.get);
customerRouter.get("/site-visit/:id", common_validation_1.default.idRequiredParams, visitRequest_1.default.getByServiceReqId);
customerRouter.post("/site-visit", visitRequest_validation_1.default.store, visitRequest_1.default.create);
// Bid Request
customerRouter.get("/bids", bidRequest_1.default.getByVendorId);
customerRouter.post("/bid/accept", bid_validation_1.default.bidAcceptValidation, bidRequest_1.default.bidAccept);
customerRouter.post("/bid/reject", common_validation_1.default.idRequiredParams, bidRequest_1.default.bidReject);
customerRouter.post("/bid", common_validation_1.default.idRequired, bidRequest_1.default.bidDetailView); //a
customerRouter.post("/bid-request", bid_validation_1.default.store, bidRequest_1.default.store);
customerRouter.post("/earning/money-collected", common_validation_1.default.idRequiredParams, myEarning_1.default.moneyCollected);
// Bid Request Vendor
// Payment Method
customerRouter.post("/card", card_validation_1.default.store, paymentMethods_1.default.store);
customerRouter.get("/cards", paymentMethods_1.default.getAll);
customerRouter.get("/get-card-by-id", common_validation_1.default.idRequiredQuery, paymentMethods_1.default.getCard);
customerRouter.delete("/card/delete", common_validation_1.default.idRequiredQuery, paymentMethods_1.default.destroy);
// service Type
//myAssets Management
customerRouter.post("/my-assets", myAssets_validation_1.default.store, myAssets_1.default.store);
customerRouter.get("/my-assets-get", myAssets_1.default.get);
customerRouter.get("/my-assets-edit", common_validation_1.default.idRequiredQuery, myAssets_1.default.edit);
customerRouter.delete("/my-assets-delete", common_validation_1.default.idRequiredQuery, myAssets_1.default.destroy);
customerRouter.post("/user-asset/change-status", common_validation_1.default.idRequired, myAssets_1.default.changeStatus);
//Vendor Management
customerRouter.post("/get-reviews", reviews_1.default.getByVendorId);
//report User and Provider
customerRouter.post("/report-request", reportRequest_validation_1.default.store, reportRequest_1.default.store);
customerRouter.post("/make-payment", payment_validation_1.default.store, paymentTransaction_1.default.store);
//my earning 
customerRouter.get("/my-earning/get", myEarning_1.default.get);
//service-type 
customerRouter.get("/services-type/get", servicesType_1.default.getlist);
customerRouter.post("/my-services", myServices_validation_1.default.store, myServices_1.default.store);
customerRouter.get("/my-services/get", myServices_1.default.get);
customerRouter.post("/my-service/notes", myServices_1.default.addUpdateOurServiceNotes);
customerRouter.get("/dashboard", auth_1.default.dashboardCustomer);
// Export default
exports.default = customerRouter;
