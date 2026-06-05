import User from "../models/user.js";
import Doctor  from "../models/doctor.js";
import Patient from "../models/patient.js";
import Appointment from "../models/appointment.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments] =
      await Promise.all([
        User.countDocuments(),
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
      ]);

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};