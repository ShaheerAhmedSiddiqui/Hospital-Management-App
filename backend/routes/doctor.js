import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  createDoctor,
} from "../controller/doctor.js";

const router = express.Router();

router.get("/", getAllDoctors); // public
router.get("/:id", getDoctorById); // public
router.post("/", protect, authorize("admin"), createDoctor)
router.put("/:id/profile", protect, authorize("doctor", "admin"), updateDoctorProfile);

export default router;