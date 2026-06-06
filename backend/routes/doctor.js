import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  createDoctor,
} from "../controller/doctor.js";

const router = express.Router();

router.get("/", getAllDoctors); // public
router.get("/:id", getDoctorById); // public
router.post("/", protect, authorize("admin"), createDoctor)
router.put("/:id", protect, authorize("doctor", "admin"), updateDoctor);

export default router;