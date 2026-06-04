import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  bookAppointment,
  getAppointments,
  updateStatus,
  cancelAppointment,
} from "../controllers/appointment.js";

const router = express.Router();

router.post("/", protect, authorize("patient"), bookAppointment);

router.get("/", protect, getAppointments); // filtered by role inside controller

router.put(
  "/:id/status",
  protect,
  authorize("doctor", "admin", "receptionist"),
  updateStatus
);

router.delete(
  "/:id",
  protect,
  authorize("patient", "admin"),
  cancelAppointment
);

export default router;