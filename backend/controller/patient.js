import Patient from "../models/patient.js";
import User from '../models/User.js';  

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("userId", "name email phone");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updatePatient = async (req, res) => {
  try {
    // 1 Check if req.body even exists
    if (!req.body) {
      return res.status(400).json({ message: "Payload body was not received by the server." });
    }

    // 2 — Safe destructuring fallback
    const { name, email, phoneNumber, gender, address, dateOfBirth } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized, token missing." });
    }

    // 3 — Proceed with updates safely using local variables instead of direct req.body chains
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: userId },
      { phoneNumber, gender, address, dateOfBirth },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: "Profile updated successfully!",
      user: {
        ...updatedUser._doc,
        ...updatedPatient._doc
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};