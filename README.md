<div align="center">

<img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

# 🏥 Hospital Management System

**A production-ready, full-stack Hospital Management System built with the MERN stack.**  
Role-based access control, secure doctor onboarding, email verification, appointment scheduling, and a clean admin dashboard — all in one platform.

[![Backend CI](https://github.com/ShaheerAhmedSiddiqui/Hospital-Management-App/actions/workflows/backend.yml/badge.svg)](https://github.com/ShaheerAhmedSiddiqui/Hospital-Management-App/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/ShaheerAhmedSiddiqui/Hospital-Management-App/actions/workflows/frontend.yml/badge.svg)](https://github.com/ShaheerAhmedSiddiqui/Hospital-Management-App/actions/workflows/frontend.yml)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [User Flows](#-user-flows)
- [CI/CD](#-cicd)

---

## 🧭 Overview

This Hospital Management System goes beyond basic CRUD. It implements real-world workflows including:

- A **multi-step doctor onboarding** approval pipeline
- **Lazy patient profile creation** — a patient record is only created when the user books their first appointment
- **Email verification** for both patient registration and doctor account setup
- **Admin-controlled** doctor fee and availability slot management
- **Role-isolated dashboards** — each role sees only what they need

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with role-aware token payloads
- `protect` middleware validates token on every protected route
- `authorize(...roles)` middleware enforces role-level access
- Email verification required before account activation
- Bcrypt password hashing — no plaintext passwords stored anywhere

### 👨‍⚕️ Doctor Onboarding Flow
- Doctor submits a registration request (name, email, address, specialization)
- Admin reviews pending requests in the dashboard
- On approval — a **one-time secure setup link** is emailed to the doctor
- Doctor sets their own password via the link — admin never touches credentials
- Link expires in 24 hours; account is only created on completion
- On rejection — doctor is notified by email with a reason

### 🧑‍🤝‍🧑 Patient Registration Flow
- Patient submits email → verification link is sent
- Patient clicks link → sets their own password
- Patient profile is created **lazily** on first appointment booking (not at registration)
- Keeps the `patients` collection clean — only real, active patients exist

### 📅 Appointment System
- Patients can only book on days/times matching the doctor's available slots
- Duplicate booking prevention (same doctor + date + time)
- Status lifecycle: `pending → confirmed → completed / cancelled`
- Doctors can confirm, decline, or mark appointments as completed
- Admin can override any appointment status

### 🏥 Admin Dashboard
- Live stats: total users, doctors, patients, appointments
- Pending doctor request queue with approve/reject actions
- Doctor profile setup: fee, qualification, experience, bio, availability slots
- User management: activate/deactivate any user account
- Department management: create and assign departments

### 👨‍⚕️ Doctor Dashboard
- Today's schedule at a glance
- Appointment management with confirm/decline/complete actions
- Read-only view of admin-configured profile (fee, slots)
- Patient history derived from appointment records

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State Management | Context API |
| HTTP Client | Axios (with request interceptors) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| CI/CD | GitHub Actions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                     │
│     Pages · Components · Context API · Axios        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│              Express.js Backend                     │
│         Routes · Controllers · Nodemailer           │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Auth Middleware                        │
│         protect() · authorize(...roles)             │
└──────┬──────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│                  MongoDB                            │
│  Users · DoctorRequests · Doctors · Patients        │
│  Appointments · Departments                         │
└─────────────────────────────────────────────────────┘
```

### Role-Based Access

| Role | Access |
|---|---|
| `admin` | Full system access, doctor approvals, user management |
| `doctor` | Own appointments, own profile (read), patient history |
| `patient` | Book appointments, own appointment history, own profile |

---

## 📁 Project Structure

```
hospital-app/
├── .github/
│    └── workflows/
│         ├── backend.yml          # Backend CI pipeline
│         └── frontend.yml         # Frontend CI pipeline
│
├── backend/
│    ├── config/
│    │    └── db.js                # MongoDB connection
│    ├── controllers/
│    │    ├── auth.controller.js   # register, login, doctor setup, patient setup
│    │    ├── doctor.controller.js # CRUD + profile update
│    │    ├── patient.controller.js
│    │    ├── appointment.controller.js
│    │    ├── department.controller.js
│    │    └── admin.controller.js  # dashboard, approvals, user management
│    ├── middleware/
│    │    └── auth.middleware.js   # protect + authorize
│    ├── models/
│    │    ├── User.js
│    │    ├── Doctor.js
│    │    ├── Patient.js
│    │    ├── Appointment.js
│    │    ├── DoctorRequest.js
│    │    └── Department.js
│    ├── routes/
│    │    ├── auth.js
│    │    ├── doctor.js
│    │    ├── patient.js
│    │    ├── appointment.js
│    │    ├── department.js
│    │    └── admin.js
│    ├── utils/
│    │    └── sendEmail.js         # Nodemailer helper
│    └── server.js
│
└── frontend/
     └── src/
          ├── components/
          │    ├── Navbar.tsx
          │    └── ProtectedRoute.tsx
          ├── context/
          │    └── AuthContext.tsx
          ├── pages/
          │    ├── Login.tsx
          │    ├── Register.tsx
          │    ├── DoctorRegister.tsx
          │    ├── DoctorSetup.tsx
          │    ├── Unauthorized.tsx
          │    ├── admin/
          │    │    ├── Dashboard.tsx
          │    │    ├── DoctorRequests.tsx
          │    │    ├── ManageDoctors.tsx
          │    │    ├── ManagePatients.tsx
          │    │    ├── AllAppointments.tsx
          │    │    ├── ManageUsers.tsx
          │    │    └── Departments.tsx
          │    ├── doctor/
          │    │    ├── Dashboard.tsx
          │    │    ├── Appointments.tsx
          │    │    ├── Profile.tsx
          │    │    └── Patients.tsx
          │    └── patient/
          │         ├── Dashboard.tsx
          │         ├── BookAppointment.tsx
          │         ├── MyAppointments.tsx
          │         └── Profile.tsx
          ├── services/
          │    └── api.ts           # Axios instance + all API calls
          ├── types/
          │    └── index.ts         # Shared TypeScript interfaces
          ├── App.tsx
          └── main.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account with App Password enabled (for Nodemailer)

### 1. Clone the repository

```bash
git clone https://github.com/ShaheerAhmedSiddiqui/Hospital-Management-App.git
cd Hospital-Management-App
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
MONGO_URI=mongodb://localhost:27017/hospital_db
JWT_SECRET=your_super_secret_key
PORT=5000
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Start the backend:

```bash
node index.js
or
npm run start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`

### 4. Create the first admin

Since self-registering as admin is blocked, seed one directly in MongoDB:

```js
// Run in MongoDB shell or Compass
db.users.insertOne({
  name: "Super Admin",
  email: "admin@hospital.com",
  password: "<bcrypt-hashed-password>",
  role: "admin",
  isActive: true
})
```

Or use the `/api/auth/register` endpoint temporarily, set role to `admin` in the DB, then re-enable the block.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password (not your real password) |

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register as patient |
| POST | `/api/auth/login` | Public | Login (all roles) |
| GET | `/api/auth/me` | Protected | Get logged-in user |
| POST | `/api/auth/doctor-register` | Public | Submit doctor request |
| POST | `/api/auth/doctor-setup/:token` | Public | Doctor sets password |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Stats overview |
| GET | `/api/admin/doctor-requests` | Admin | Pending doctor requests |
| POST | `/api/admin/doctor-requests/:id/approve` | Admin | Approve doctor |
| POST | `/api/admin/doctor-requests/:id/reject` | Admin | Reject doctor |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle` | Admin | Activate/deactivate user |

### Doctors
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/doctors` | Public | List all doctors |
| GET | `/api/doctors/me` | Doctor | Own profile |
| GET | `/api/doctors/:id` | Public | Doctor by ID |
| PUT | `/api/doctors/:id/profile` | Admin | Set fee, slots, bio |

### Appointments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments` | Protected | Get appointments (filtered by role) |
| PUT | `/api/appointments/:id/status` | Doctor/Admin | Update status |
| DELETE | `/api/appointments/:id` | Patient/Admin | Cancel appointment |

### Departments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/departments` | Public | All departments |
| POST | `/api/departments` | Admin | Create department |
| PUT | `/api/departments/:id` | Admin | Update department |

---

## 🔄 User Flows

### Doctor Registration Flow
```
Doctor submits request
        ↓
DoctorRequest saved (status: pending)
        ↓
Admin reviews → Approve / Reject
        ↓ (approved)
Secure setup token generated
        ↓
Setup link emailed to doctor (expires 24h)
        ↓
Doctor sets own password
        ↓
User + Doctor documents created
        ↓
status: account_created → Doctor can login
```

### Patient Registration Flow
```
Patient submits email
        ↓
Verification email sent
        ↓
Patient clicks link → sets password
        ↓
User created (role: patient)
        ↓
Patient books first appointment
        ↓
Patient document auto-created (lazy)
        ↓
Appointment document created
```

### Appointment Booking Flow
```
Patient selects doctor
        ↓
Picks available day + time slot
        ↓
POST /api/appointments
        ↓
Backend: findOrCreate Patient doc
        ↓
Duplicate check (same doctor/date/time)
        ↓
Appointment created (status: pending)
        ↓
Doctor confirms → status: confirmed
        ↓
Visit done → status: completed
```

---

## ⚙️ CI/CD

This project uses **GitHub Actions** for automated testing and build checks.

### `.github/workflows/backend.yml`
Runs on every push to `main` and on pull requests:
- Installs Node.js dependencies
- Runs lint checks
- Verifies the server starts without errors

### `.github/workflows/frontend.yml`
Runs on every push to `main` and on pull requests:
- Installs dependencies
- Runs `tsc --noEmit` for TypeScript type checking
- Runs `npm run build` to verify production build succeeds

---

<div align="center">

Built with ❤️ using the MERN stack

⭐ Star this repo if you found it helpful

</div>
