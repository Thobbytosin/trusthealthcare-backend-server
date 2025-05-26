import { Router } from "express";
import {
  hasDoctorProfileBeenUpdatedLast7days,
  isUserAuthenticated,
} from "../middlewares/authentication";
import { authorizeUpload } from "../middlewares/admin-auth";
import {
  getAllDoctorsList,
  getDoctor,
  getDoctorAvailableSlot,
  getSomeDoctorsUnauthenticated,
  updateDoctor,
  uploadDoctor,
} from "../controllers/doctor.controller";
import { validateDoctorData } from "../middlewares/validatedoctorData";
import { formParser } from "../middlewares/formParser";

const doctorRouter = Router();

// UPLOAD A DOCTOR
doctorRouter.post(
  "/upload-doctor",
  isUserAuthenticated,
  authorizeUpload("admin", "user"),
  formParser,
  validateDoctorData,
  uploadDoctor
);

// GET SOME DOCTORS (FOR LANDING PAGE)
doctorRouter.get("/get-some-doctors-free", getSomeDoctorsUnauthenticated);

// GET DOCTORS (SEARCH, SORT, FILTER)
doctorRouter.get("/get-all-doctors", isUserAuthenticated, getAllDoctorsList);

// UPDATE A DOCTOR
doctorRouter.put(
  "/update-doctor/:doctor_id",
  isUserAuthenticated,
  hasDoctorProfileBeenUpdatedLast7days,
  formParser,
  validateDoctorData,
  updateDoctor
);

// GET A DOCTOR
doctorRouter.get("/get-doctor/:doctor_id", isUserAuthenticated, getDoctor);

// GET A DOCTOR AVAILABLE SLOTS
doctorRouter.get(
  "/available-slots/:doctor_id",
  isUserAuthenticated,
  getDoctorAvailableSlot
);

export default doctorRouter;
