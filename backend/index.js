import 'dotenv/config';
import cors from 'cors'; 
import express from "express";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctor.js";
import patientRoutes from "./routes/patient.js";
import appointmentRoutes from "./routes/appointment.js";
import departmentRoutes from "./routes/department.js";
import adminRoutes from "./routes/admin.js";



// Connect Database
connectDB();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                
}));



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/admin", adminRoutes);

// Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime()
  });
});
// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});