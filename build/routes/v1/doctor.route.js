"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_auth_1 = require("../../middlewares/user-auth");
const admin_auth_1 = require("../../middlewares/admin-auth");
const doctor_controller_1 = require("../../controllers/doctor.controller");
const validatedoctorData_1 = require("../../middlewares/validatedoctorData");
const formParser_1 = require("../../middlewares/formParser");
const doctor_auth_1 = require("../../middlewares/doctor-auth");
const apiKey_auth_1 = require("../../middlewares/apiKey-auth");
const doctorRouterV1 = (0, express_1.Router)();
// UPLOAD A DOCTOR
doctorRouterV1.post("/upload-doctor", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, (0, admin_auth_1.authorizeUpload)("admin", "user"), formParser_1.formParser, validatedoctorData_1.validateDoctorData, doctor_controller_1.uploadDoctor);
// GET SOME DOCTORS (FOR LANDING PAGE)
doctorRouterV1.get("/doctors-list-unauthenticated", doctor_controller_1.getSomeDoctorsUnauthenticated);
// GET DOCTORS (SEARCH, SORT, FILTER)
doctorRouterV1.get("/get-all-doctors", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, doctor_controller_1.getAllDoctorsList);
// UPDATE A DOCTOR
doctorRouterV1.put("/update-doctor/:doctor_id", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, doctor_auth_1.hasDoctorProfileBeenUpdatedLast7days, formParser_1.formParser, validatedoctorData_1.validateDoctorData, doctor_controller_1.updateDoctor);
// GET A DOCTOR
doctorRouterV1.get("/get-doctor/:doctor_id", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, doctor_controller_1.getDoctor);
// GET A DOCTOR AVAILABLE SLOTS
doctorRouterV1.get("/available-slots/:doctor_id", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, doctor_controller_1.getDoctorAvailableSlot);
// GET A DOCTOR META TAGS
doctorRouterV1.get("/meta-tags/:doctor_id", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, doctor_controller_1.getDoctorMeta);
exports.default = doctorRouterV1;
