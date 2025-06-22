"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../../controllers/admin.controller");
const admin_auth_1 = require("../../middlewares/admin-auth");
const admin_controller_2 = require("../../controllers/admin.controller");
const adminRouterV1 = (0, express_1.Router)();
// DELETE A USER ACCOUNT
adminRouterV1.delete("/delete-user/:userId", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_1.deleteUser);
// GET ALL USERS
adminRouterV1.get("/get-all-users-admin", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_1.getAllUsersAdmin);
// GET ALL DOCTORS
adminRouterV1.get("/get-all-doctors-admin", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_1.getAllDoctorsAdmin);
// GET A DOCTOR
adminRouterV1.get("/get-doctor-admin/:doctor_id", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_1.getDoctorAdmin);
// APPLICATION ACCEPTED
adminRouterV1.put("/application-success/:doctor_id", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_2.doctorApplicationApproval);
// APPLICATION DENIED
adminRouterV1.put("/application-failed/:doctor_id", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_2.doctorApplicationDenial);
// DELETE DOCTOR ACCOUNT
adminRouterV1.delete("/delete-doctor/:doctor_id", (0, admin_auth_1.authorizeRoleAdmin)("admin"), admin_controller_1.deleteDoctorAccount);
exports.default = adminRouterV1;
