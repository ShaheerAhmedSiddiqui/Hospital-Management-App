import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import Appointment from "../models/appointment.js";
import DoctorRequest from "../models/DoctorRequest.js";
import {sendEmail} from "../utils/sendEmail.js";
import bcrypt  from "bcryptjs";
import crypto from "crypto";

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


export const getDoctorRequests = async (req, res) => {
  const request = await DoctorRequest.find({});
  if (!request) {
    return res.json("No Doctor Request Found");
  }

  return res.json(request);
}

export const approveDoctorRequest = async (req, res) => {
  try {
    const request = await DoctorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.approvalStatus == 'registeration_approved') {
      return res.status(400).json({ message: `Request is already ${request.approvalStatus}` });
    }

    // generate a secure one-time setup token
    const setupToken   = crypto.randomBytes(32).toString('hex');
    const setupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    request.approvalStatus = 'registeration_approved';
    request.setupToken         = setupToken;
    request.setupTokenExpires  = setupExpires;
    await request.save();

    // this link goes to your React frontend page
    const setupUrl = `http://localhost:5173/doctor-setup/${setupToken}`;

    await sendEmail({
      to:      request.email,
      subject: 'Your doctor registration has been approved!',
      html: `
        <h2>Congratulations Dr. ${request.name}!</h2>
        <p>Your registration request has been approved by the admin.</p>
        <p>Please click the button below to set up your password and activate your account:</p>
        <br/>
        <a href="${setupUrl}"
          style="padding:12px 24px;background:#4F46E5;color:white;
                 border-radius:6px;text-decoration:none;font-size:16px;">
          Set Up My Account
        </a>
        <br/><br/>
        <p>⚠️ This link expires in <strong>24 hours</strong>.</p>
        <p>If you did not register, please ignore this email.</p>
      `,
    });

    res.json({
      message: `Request approved. Setup link sent to ${request.email}`,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const rejectDoctorRequest = async (req, res) => {
  try {
    const request = await DoctorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.approvalStatus = 'rejected';
    await request.save();

    await sendEmail({
      to:      request.email,
      subject: 'Update on your hospital registration request',
      html: `
        <h2>Hello Dr. ${request.name},</h2>
        <p>We regret to inform you that your registration request has not been approved.</p>
        <p><strong>Reason:</strong> ${req.body.reason || 'No reason provided.'}</p>
        <p>For further information, please contact the hospital administration.</p>
      `,
    });

    res.json({ message: 'Request rejected and doctor notified.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};