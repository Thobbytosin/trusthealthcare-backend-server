import { Router } from "express";
import {
  deleteDoctorAccount,
  deleteUser,
  getAllDoctorsAdmin,
  getAllUsersAdmin,
  getDoctorAdmin,
} from "../../controllers/admin.controller";
import { authorizeRoleAdmin } from "../../middlewares/admin-auth";
import {
  doctorApplicationApproval,
  doctorApplicationDenial,
} from "../../controllers/admin.controller";
const adminRouterV1 = Router();

// DELETE A USER ACCOUNT
adminRouterV1.delete(
  "/delete-user/:userId",
  authorizeRoleAdmin("admin"),
  deleteUser
);

// GET ALL USERS
adminRouterV1.get(
  "/get-all-users-admin",
  authorizeRoleAdmin("admin"),
  getAllUsersAdmin
);

// GET ALL DOCTORS
adminRouterV1.get(
  "/get-all-doctors-admin",
  authorizeRoleAdmin("admin"),
  getAllDoctorsAdmin
);

// GET A DOCTOR
adminRouterV1.get(
  "/get-doctor-admin/:doctor_id",
  authorizeRoleAdmin("admin"),
  getDoctorAdmin
);

// APPLICATION ACCEPTED
adminRouterV1.put(
  "/application-success/:doctor_id",
  authorizeRoleAdmin("admin"),
  doctorApplicationApproval
);

// APPLICATION DENIED
adminRouterV1.put(
  "/application-failed/:doctor_id",
  authorizeRoleAdmin("admin"),
  doctorApplicationDenial
);

// DELETE DOCTOR ACCOUNT
adminRouterV1.delete(
  "/delete-doctor/:doctor_id",
  authorizeRoleAdmin("admin"),
  deleteDoctorAccount
);

export default adminRouterV1;
