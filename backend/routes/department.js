import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controller/department.js";

const router = express.Router();

router.get("/", getAllDepartments); // public
router.get("/:id", getDepartmentById); // public

router.post("/", protect, authorize("admin"), createDepartment);
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

export default router;