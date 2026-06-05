import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controller/patient.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "doctor" ), getAllPatients);

router.get("/:id", protect, authorize("admin", "doctor",  "patient"), getPatientById);

router.put( "/:id", protect, authorize("admin", "patient"), updatePatient);

router.delete("/:id", protect,authorize("admin"),deletePatient);

export default router;