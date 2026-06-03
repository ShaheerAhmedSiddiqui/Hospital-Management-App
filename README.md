🏥 Hospital Management System (MERN Stack)

A full-stack Hospital Management System built using the MERN stack (MongoDB, Express, React, Node.js) with role-based authentication and secure API architecture. This system streamlines hospital operations by managing patients, doctors, appointments, and departments in an efficient and scalable way.

🚀 Features
🔐 Role-Based Authentication (JWT)
Admin, Doctor, Patient, Receptionist roles
Secure access control for each role
👨‍⚕️ Doctor Management
Add and manage doctor profiles
Specialization and availability scheduling
🧑‍🤝‍🧑 Patient Management
Patient registration and records
Appointment booking system
📅 Appointment System
Book, update, and track appointments
Status management (pending, confirmed, completed, cancelled)
🏥 Department Management
Organize hospital departments and services
🔒 Secure Backend
JWT authentication middleware
Role-based route protection
🧱 Tech Stack
Frontend: React, Context API, Axios
Backend: Node.js, Express.js
Database: MongoDB (Mongoose ODM)
Authentication: JSON Web Tokens (JWT)

🏗️ Architecture
Frontend (React) → REST API (Express) → Middleware (JWT Auth & Role Check) → MongoDB (Mongoose Models)

📁 Project Structure
hospital-app/
 ├── backend/
 │    ├── config/
 │    ├── models/
 │    ├── routes/
 │    ├── controllers/
 │    ├── middleware/
 │    └── server.js
 └── frontend/
      ├── src/
           ├── pages/
           ├── components/
           ├── context/
           └── services/

🎯 Goal

To build a scalable and secure hospital management platform that simplifies scheduling, improves communication between patients and doctors, and centralizes hospital operations.           
