import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getDoctorRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
} from "../controller/admin.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

router.get("/users", protect, authorize("admin"), getAllUsers);

router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus);

router.get("/doctor-request", protect, authorize("admin"), getDoctorRequests);
router.post('/doctor-request/:id/approve', protect, authorize("admin"), approveDoctorRequest);
router.post('/doctor-request/:id/reject', protect, authorize("admin"), rejectDoctorRequest);

export default router;