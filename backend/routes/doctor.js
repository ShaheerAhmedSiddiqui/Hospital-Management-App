import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
} from "../controllers/doctor.js";

const router = express.Router();

router.get("/", getAllDoctors); // public
router.get("/:id", getDoctorById); // public

router.put("/:id", protect, authorize("doctor", "admin"), updateDoctor);

export default router;