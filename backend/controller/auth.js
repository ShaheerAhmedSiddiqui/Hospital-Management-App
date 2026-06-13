import jwt from "jsonwebtoken";
import User from "../models/user.js"
import crypto from "crypto";
import DoctorRequest from "../models/DoctorRequest.js";
import { sendEmail } from "../utils/sendEmail.js";
import Doctor from "../models/doctor.js";

//  TOKEN 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//  REGISTER 
export const register = async (req, res, next) => {
  const { name, email, password, role, specialization } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot self-register as admin' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      specialization,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
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
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ _id: user._id, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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
  const { name, email, address, specialization } = req.body;

  try {
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

    const verifyUrl = `http://localhost:5000/api/auth/verify-email/${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email — Hospital System',
      html: `
        <h2>Hello Dr. ${name},</h2>
        <p>Thank you for registering. Please verify your email to submit your request for admin approval.</p>
        <a href="${verifyUrl}" style="padding:10px 20px;background:#4F46E5;color:white;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
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
    const request = await DoctorRequest.findOne({
      emailVerifyToken: req.params.token,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!request) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    request.emailStatus = 'email_verified';
    request.emailVerifyToken = undefined;
    request.emailVerifyExpires = undefined;
    await request.save();

    res.json({ message: 'Email verified successfully. Please wait for admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SETUP DOCTOR ACCOUNT
export const setupDoctorAccount = async (req, res) => {
  const { password, confirmPassword } = req.body;
  // 👇 PLACE THIS AT THE TOP OF TRY BLOCK TO SEE INDEPENDENT TRUTH 👇
console.log("--- DEBUGGING SETUP ACCOUNT ---");
console.log("Token Received from Frontend URL:", req.params.token);

// Try to find the request ONLY by the token to see what state it is in
const rawDoc = await DoctorRequest.findOne({ setupToken: req.params.token });
if (!rawDoc) {
  console.log("❌ CRITICAL: No document exists in DB with this setupToken!");
} else {
  console.log("✅ Document Found!");
  console.log("Current DB Approval Status:", rawDoc.approvalStatus);
  console.log("Does status match 'registeration_approved'?", rawDoc.approvalStatus === 'registeration_approved');
  console.log("DB Expiration Time:", rawDoc.setupTokenExpires);
  console.log("Current Server Time:", new Date());
  console.log("Is the token expired?", rawDoc.setupTokenExpires < new Date());
}
console.log("--------------------------------");
  try {
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Both password fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const request = await DoctorRequest.findOne({
      setupToken: req.params.token,
      setupTokenExpires: { $gt: new Date() },
      approvalStatus: 'registeration_approved',
    });

    if (!request) {
      return res.status(400).json({
        message: 'Setup link is invalid or has expired. Please contact admin.',
      });
    }

    const { name, email, specialization } = request;

    const userExists = await User.findOne({ email });
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

    // Otherwise, proceed normally if it's the genuine first request
    const user = await User.create({
      name,
      email,
      specialization,
      password,
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
      to: email,
      subject: 'Welcome to the Hospital System! Account Created', 
      html: `
        <h2>Hello Dr. ${name},</h2>
        <p>Your professional account has been successfully set up and is ready to use.</p>
        <p>You can now log in to your dashboard using your email and the password you just created.</p>
        <a href="http://localhost:5173/login" style="padding:10px 20px;background:#10B981;color:white;border-radius:6px;text-decoration:none;display:inline-block;">
          Login to Dashboard
        </a>
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