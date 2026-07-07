import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import Appointment from "../models/appointment.js";
import DoctorRequest from "../models/doctorRequest.js";
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

    const setupToken   = crypto.randomBytes(32).toString('hex');
    const setupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    request.approvalStatus = 'registeration_approved';
    request.setupToken         = setupToken;
    request.setupTokenExpires  = setupExpires;
    await request.save();

    const setupUrl = `${process.env.FRONTEND_URL}/doctor-setup/${setupToken}`;
    
    await sendEmail({
      to:      request.email,
      subject: 'Application Approved — Access Credentials Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f9;padding:40px 10px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color:#4f46e5;padding:30px 20px;">
                      <h1 style="color:#ffffff;margin:0;font-size:22px;">Registration Board</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="margin-top:0;color:#1e293b;font-size:18px;">Congratulations Dr. ${request.name}!</h2>
                      <p style="color:#475569;font-size:15px;line-height:1.6;">Your credential package review is complete, and verification status is confirmed. Use the gateway utility below to set up your interface securely.</p>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding:20px 0;">
                            <a href="${setupUrl}" target="_blank" style="background-color:#4f46e5;color:#ffffff;display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">Initialize My Dashboard</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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

    request.approvalStatus = 'registeration_rejected';
    await request.save();

    const {name, email} = request;
    await sendEmail({
      to:      email,
      subject: 'Registration Update — Portal Review',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f9;padding:40px 10px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color:#ef4444;padding:30px 20px;">
                      <h1 style="color:#ffffff;margin:0;font-size:22px;">Review Verdict</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="margin-top:0;color:#1e293b;font-size:18px;">Hello Dr. ${name},</h2>
                      <p style="color:#475569;font-size:15px;line-height:1.6;">Your submitted practitioner application cannot be processed into runtime files at this stage.</p>
                      <p style="color:#1e293b;font-size:15px;"><strong>Details:</strong> ${req.body.reason || 'No additional reason specified.'}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({ message: 'Request rejected and doctor notified.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};