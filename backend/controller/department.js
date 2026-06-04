const Department = require("../models/Department");

const getAllDepartments = async (req, res) => {
  try {
    const depts = await Department.find().populate("head", "specialization");
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!dept) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);

    if (!dept) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};