import { Router } from "express";
import { updateAccessToken } from "../middlewares/updateToken";
import { isUserAuthenticated } from "../middlewares/authentication";
import {
  authorizeRoleAdmin,
  authorizeRoleAdminAndDoctor,
} from "../middlewares/admin-auth";
import {
  deleteDoctor,
  editDoctor,
  getAllDoctorsAdmin,
  getAllDoctorsList,
  getDoctor,
  getDoctorAdmin,
  uploadDoctor,
} from "../controllers/doctor.controller";
import { validateDoctorData } from "../middlewares/validateDoctor";

const doctorRouter = Router();

doctorRouter.post(
  "/upload-doctor",
  updateAccessToken,
  isUserAuthenticated,
  authorizeRoleAdminAndDoctor("administrator", "user"),
  validateDoctorData,
  uploadDoctor
);

// edit doctor
doctorRouter.put(
  "/edit-doctor/:doctor_id",
  updateAccessToken,
  isUserAuthenticated,
  authorizeRoleAdminAndDoctor("administrator", "doctor"),
  validateDoctorData,
  editDoctor
);

doctorRouter.delete(
  "/delete-doctor/:doctor_id",
  updateAccessToken,
  isUserAuthenticated,
  authorizeRoleAdmin("administrator"),
  deleteDoctor
);

doctorRouter.get(
  "/get-doctor/:doctor_id",
  updateAccessToken,
  isUserAuthenticated,
  getDoctor
);

doctorRouter.get(
  "/get-doctor-admin/:doctor_id",
  updateAccessToken,
  isUserAuthenticated,
  authorizeRoleAdmin("administrator"),
  getDoctorAdmin
);

doctorRouter.get("/get-doctors", getAllDoctorsList);

doctorRouter.get(
  "/get-doctors-list-admin",
  isUserAuthenticated,
  updateAccessToken,
  authorizeRoleAdmin("administrator"),
  getAllDoctorsAdmin
);

export default doctorRouter;
