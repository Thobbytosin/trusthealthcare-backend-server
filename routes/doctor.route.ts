import { Router } from "express";
import { updateToken } from "../middlewares/updateToken";
import { isUserAuthenticated } from "../middlewares/authentication";
import { authorizeRoleAdmin, authorizeUpload } from "../middlewares/admin-auth";
import {
  getAllDoctorsList,
  // deleteDoctor,
  // editDoctor,
  // getAllDoctorsAdmin,
  // getAllDoctorsList,
  // getDoctor,
  // getDoctorAdmin,
  uploadDoctor,
} from "../controllers/doctor.controller";
import { validateDoctorData } from "../middlewares/validatedoctorData";
import { formParser } from "../middlewares/formParser";

const doctorRouter = Router();

doctorRouter.post(
  "/upload-doctor",
  isUserAuthenticated,
  authorizeUpload("admin", "user"),
  formParser,
  validateDoctorData,
  uploadDoctor
);

// edit doctor
// doctorRouter.put(
//   "/edit-doctor/:doctor_id",
//   updateAccessToken,
//   isUserAuthenticated,
//   authorizeRoleAdminAndDoctor("administrator", "doctor"),
//   validateDoctorData,
//   editDoctor
// );

// doctorRouter.delete(
//   "/delete-doctor/:doctor_id",
//   updateAccessToken,
//   isUserAuthenticated,
//   authorizeRoleAdmin("administrator"),
//   deleteDoctor
// );

// doctorRouter.get(
//   "/get-doctor/:doctor_id",
//   updateAccessToken,
//   isUserAuthenticated,
//   getDoctor
// );

// doctorRouter.get(
//   "/get-doctor-admin/:doctor_id",
//   updateAccessToken,
//   isUserAuthenticated,
//   authorizeRoleAdmin("administrator"),
//   getDoctorAdmin
// );

doctorRouter.get("/get-all-doctors-free", getAllDoctorsList);

// doctorRouter.get(
//   "/get-doctors-list-admin",
//   isUserAuthenticated,
//   updateToken,
//   authorizeRoleAdmin("admin"),
//   getAllDoctorsList
// );

export default doctorRouter;
