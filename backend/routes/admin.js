import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

router.get("/users", protect, authorize("admin"), getAllUsers);

router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus);

export default router;