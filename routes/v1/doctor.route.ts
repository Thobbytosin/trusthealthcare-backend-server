import { Router } from "express";
import { isUserAuthenticated } from "../../middlewares/user-auth";
import { authorizeUpload } from "../../middlewares/admin-auth";
import {
  getAllDoctorsList,
  getDoctor,
  getDoctorAvailableSlot,
  getDoctorMeta,
  getSomeDoctorsUnauthenticated,
  updateDoctor,
  uploadDoctor,
} from "../../controllers/doctor.controller";
import { validateDoctorData } from "../../middlewares/validatedoctorData";
import { formParser } from "../../middlewares/formParser";
import { hasDoctorProfileBeenUpdatedLast7days } from "../../middlewares/doctor-auth";
import { apiKeyAuth } from "../../middlewares/apiKey-auth";

const doctorRouterV1 = Router();

// UPLOAD A DOCTOR
doctorRouterV1.post(
  "/upload-doctor",
  isUserAuthenticated,
  apiKeyAuth,
  authorizeUpload("admin", "user"),
  formParser,
  validateDoctorData,
  uploadDoctor
);

// GET SOME DOCTORS (FOR LANDING PAGE)
doctorRouterV1.get("/get-some-doctors-free", getSomeDoctorsUnauthenticated);

// GET DOCTORS (SEARCH, SORT, FILTER)
doctorRouterV1.get(
  "/get-all-doctors",
  isUserAuthenticated,
  apiKeyAuth,
  getAllDoctorsList
);

// UPDATE A DOCTOR
doctorRouterV1.put(
  "/update-doctor/:doctor_id",
  isUserAuthenticated,
  apiKeyAuth,
  hasDoctorProfileBeenUpdatedLast7days,
  formParser,
  validateDoctorData,
  updateDoctor
);

// GET A DOCTOR
doctorRouterV1.get(
  "/get-doctor/:doctor_id",
  isUserAuthenticated,
  apiKeyAuth,
  getDoctor
);

// GET A DOCTOR AVAILABLE SLOTS
doctorRouterV1.get(
  "/available-slots/:doctor_id",
  isUserAuthenticated,
  apiKeyAuth,
  getDoctorAvailableSlot
);

// GET A DOCTOR META TAGS
doctorRouterV1.get(
  "/meta-tags/:doctor_id",
  isUserAuthenticated,
  apiKeyAuth,
  getDoctorMeta
);

export default doctorRouterV1;
