import { Router } from "express";
import {
  deleteDoctorAccount,
  deleteUser,
  getAllDoctorsAdmin,
  getAllUsersAdmin,
  getDoctorAdmin,
} from "../controllers/admin.controller";
import { isUserAuthenticated } from "../middlewares/authentication";
import { authorizeRoleAdmin } from "../middlewares/admin-auth";
import {
  doctorApplicationApproval,
  doctorApplicationDenial,
} from "../controllers/admin.controller";
const adminRouter = Router();

// DELETE A USER ACCOUNT
adminRouter.delete(
  "/delete-user/:userId",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  deleteUser
);

// GET ALL USERS
adminRouter.get(
  "/get-all-users-admin",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getAllUsersAdmin
);

// GET ALL DOCTORS
adminRouter.get(
  "/get-all-doctors-admin",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getAllDoctorsAdmin
);

// GET A DOCTOR
adminRouter.get(
  "/get-doctor-admin/:doctor_id",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getDoctorAdmin
);

// APPLICATION ACCEPTED
adminRouter.put(
  "/application-success/:doctor_id",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  doctorApplicationApproval
);

// APPLICATION DENIED
adminRouter.put(
  "/application-failed/:doctor_id",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  doctorApplicationDenial
);

// DELETE DOCTOR ACCOUNT
adminRouter.delete(
  "/delete-doctor/:doctor_id",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  deleteDoctorAccount
);

export default adminRouter;
