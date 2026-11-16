import jwt from "jsonwebtoken";
import User from "../models/user.js"
import crypto from "crypto";
import DoctorRequest from "../models/doctorRequest.js";
import { sendEmail } from "../utils/sendEmail.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";


// Validate untrusted values before they are used in database filters.
const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : null;

const isValidEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidToken = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);

//  TOKEN 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//  REGISTER 
export const startRegistration = async (req, res) => {
  try {
    const { name } = req.body;
    const email = normalizeEmail(req.body?.email);

    if (typeof name !== "string" || !name.trim() || name.length > 100 || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid name and email are required." });
    }

    // 1 — Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000;

    await User.create({
      name,
      email,
      role: 'patient',
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: tokenExpiry
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

   await sendEmail({
      to: email,
      subject: "Activate Your Medical Portal Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Activate Your Account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f9;">
            <tr>
              <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color: #2563eb; padding: 30px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">MediCare Portal</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px; background-color: #ffffff;">
                      <h2 style="margin-top: 0; color: #1e293b; font-size: 20px; font-weight: 600;">Welcome, ${name}!</h2>
                      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                        Thank you for registering with our clinic platform. To finalize your patient profile configuration and gain secure medical system entry, please confirm your destination mailbox address below.
                      </p>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 15px 0 25px 0;">
                            <a href="${verificationUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);">
                              Verify Account Setup
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        💡 <strong>Security Notice:</strong> For system integrity, this specific configuration link automatically expires in 1 hour. If you did not initialize this registration window, you can disregard this notification safely.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; 2026 MediCare Health Systems. All rights reserved.</p>
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

    res.status(200).json({
      message: "Verification link dispatched! Please check your email inbox to finalize registration."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.body?.token;

    if (!isValidToken(token)) {
      return res.status(400).json({ message: "Invalid verification token." });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Security token is invalid or has expired." });
    }

    user.password = password;

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    // 4 — Patient profile model record simultaneously
    await Patient.create({
      userId: user._id,
      phoneNumber: '',
      address: '',
      gender: 'Other'
    });

    res.status(201).json({ message: "Account setup complete! You can now log in securely." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN 
export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!isValidEmail(email) || typeof password !== "string" || !password || password.length > 128) {
      return res.status(400).json({ message: "Valid email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email Not Verfied" })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body?.email);

    if (
      typeof name !== "string" || !name.trim() || name.length > 100 ||
      !isValidEmail(email) ||
      typeof password !== "string" || password.length < 6 || password.length > 128
    ) {
      return res.status(400).json({ message: "Valid name, email, and password are required." });
    }

    const safeEmail = normalizeEmail(email);
    const userExists = await User.findOne({ email: safeEmail });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Complete your Administrator Registration",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color: #4f46e5; padding: 30px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Administrative Privileges Portal</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">System Provisioning Request</h2>
                      <p style="color: #475569; font-size: 15px; line-height: 1.6;">An administrative staff user profile has been structured under your identity credentials. Confirm authentication permissions via the initialization matrix link below.</p>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">Activate Privilege Key</a>
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
    res.status(201).json({ _id: user._id, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//verify admin email
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query?.token;

    if (!isValidToken(token)) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    // Find the user with this validated verification token
    const safeToken = token;
    const user = await User.findOne({ verificationToken: safeToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    const currentTime = Date.now();
    const tokenExpirationTime = new Date(user.verificationTokenExpires).getTime();

    if (user.verificationTokenExpires && currentTime > tokenExpirationTime) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LOGGED IN USER 
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DOCTOR REGISTER REQUEST
export const doctorRegisterRequest = async (req, res) => {
  const { name, address, specialization } = req.body;
  const email = normalizeEmail(req.body?.email);

  try {
    if (
      typeof name !== "string" || !name.trim() || name.length > 100 ||
      !isValidEmail(email) ||
      typeof address !== "string" || address.length > 500 ||
      typeof specialization !== "string" || !specialization.trim() || specialization.length > 100
    ) {
      return res.status(400).json({ message: "Valid registration details are required." });
    }

    const existing = await DoctorRequest.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A request with this email already exists' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const request = await DoctorRequest.create({
      name, email, address, specialization,
      emailVerifyToken: token,
      emailVerifyExpires: expires,
    });

    const verifyUrl = `${process.env.BACKEND_URL}/auth/verify-email/${token}`;

    await sendEmail({
      to: email,
      subject: 'Verify Your Medical Registration Request',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f9;padding:40px 10px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color:#0284c7;padding:30px 20px;">
                      <h1 style="color:#ffffff;margin:0;font-size:22px;">Doctor Credential Screening</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="margin-top:0;color:#1e293b;font-size:18px;">Hello Dr. ${name},</h2>
                      <p style="color:#475569;font-size:15px;line-height:1.6;">Thank you for initiating your integration review process. Please verify ownership of this inbox to route your documentation data directly to administration workflows.</p>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding:20px 0;">
                            <a href="${verifyUrl}" target="_blank" style="background-color:#0284c7;color:#ffffff;display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">Verify Email Identity</a>
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

    res.status(201).json({
      message: 'Registration request submitted. Please check your email to verify.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY DOCTOR EMAIL
export const verifyDoctorEmail = async (req, res) => {
  try {
    const token = req.params?.token;
    if (!isValidToken(token)) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }
    const safeToken = token;

    const request = await DoctorRequest.findOne({
      emailVerifyToken: safeToken,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!request) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    request.emailStatus = 'email_verified';
    request.emailVerifyToken = undefined;
    request.emailVerifyExpires = undefined;
    await request.save();

    console.log(request)
    res.json({ message: 'Email verified successfully. Please wait for admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SETUP DOCTOR ACCOUNT
export const setupDoctorAccount = async (req, res) => {
  const { password, confirmPassword } = req.body || {};
  try {
    const token = req.params?.token;
    if (!isValidToken(token)) {
      return res.status(400).json({ message: "Setup link is invalid or has expired. Please contact admin." });
    }
    const safeToken = token;

    if (typeof password !== "string" || typeof confirmPassword !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Both password fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const request = await DoctorRequest.findOne({
      setupToken: safeToken,
      setupTokenExpires: { $gt: new Date() },
      approvalStatus: 'registeration_approved',
    });

    if (!request) {
      return res.status(400).json({
        message: 'Setup link is invalid or has expired. Please contact admin.',
      });
    }

    const { name, email, specialization } = request;

    const safeEmail = normalizeEmail(email);
    if (!isValidEmail(safeEmail)) {
      return res.status(400).json({ message: "Invalid registration email." });
    }
    const userExists = await User.findOne({ email: safeEmail });
    if (userExists) {
      const doctorExists = await Doctor.findOne({ userId: userExists._id });

      if (doctorExists) {
        // A twin request already successfully processed this! Clean up and return success.
        request.approvalStatus = 'account_created';
        request.setupToken = undefined;
        request.setupTokenExpires = undefined;
        await request.save();

        return res.json({
          message: 'Account created successfully. You can now login.',
        });
      }

      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email: safeEmail,
      specialization,
      password,
      isVerified: request.emailStatus === 'email_verified',
      role: 'doctor',
    });

    await Doctor.create({
      userId: user._id,
      specialization,
      fees: null,
      experience: "",
      availableSlots: []
    });

    request.approvalStatus = 'account_created';
    request.setupToken = undefined;
    request.setupTokenExpires = undefined;
    await request.save();

    try {
      await sendEmail({
        to: safeEmail,
        subject: 'Welcome to the Team — Account Activated',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f9;padding:40px 10px;">
              <tr>
                <td align="center">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                    <tr>
                      <td align="center" style="background-color:#10b981;padding:30px 20px;">
                        <h1 style="color:#ffffff;margin:0;font-size:22px;">Onboarding Complete</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 30px;">
                        <h2 style="margin-top:0;color:#1e293b;font-size:18px;">Hello Dr. ${name},</h2>
                        <p style="color:#475569;font-size:15px;line-height:1.6;">Your expert dashboard configuration environment has been generated securely. You may now access core features via the standard gateway.</p>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding:20px 0;">
                              <a href="${process.env.FRONTEND_URL}/login" target="_blank" style="background-color:#10b981;color:#ffffff;display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">Go To Console</a>
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
    } catch (error) {
      console.error("Background Email delivery failed:", emailError.message);
    }

    return res.status(200).json({
      message: 'Account created successfully. You can now login.',
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};