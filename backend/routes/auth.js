import express from "express";
import { register, login, getMe, createAdmin, doctorRegisterRequest, verifyDoctorEmail, setupDoctorAccount } from "../controller/auth.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/create-admin", protect, authorize("admin"), createAdmin)
router.get("/me", protect, getMe); // get logged-in user info
router.post("/doctor-register-request", doctorRegisterRequest);
router.get('/verify-email/:token',     verifyDoctorEmail);      // new
router.post('/doctor-setup/:token',   setupDoctorAccount);
export default router;