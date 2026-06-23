import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// public
import Login           from './pages/Login';
import Register        from './pages/Register';
import DoctorRegister  from './pages/DoctorRegister';
import DoctorSetup     from './pages/DoctorSetup';
import Unauthorized    from './pages/Unauthorized';
import VerifyEmail from './pages/VerifyEmail';

// patient
import PatientDashboard  from './pages/patient/PatientDashboard';
import BookAppointment   from './pages/patient/BookAppointment';
import MyAppointments    from './pages/patient/MyAppointments';
import PatientProfile    from './pages/patient/Profile';

// doctor
import DoctorDashboard    from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorProfile      from './pages/doctor/Profile';
import DoctorPatients     from './pages/doctor/Patient';

// admin
import AdminDashboard    from './pages/admin/Dashboard';
import DoctorRequests    from './pages/admin/DoctorRequest';
import ManageDoctors     from './pages/admin/ManageDoctors';
import ManagePatients    from './pages/admin/ManagePatients';
import AllAppointments   from './pages/admin/Allappointments';
import ManageUsers       from './pages/admin/ManageUsers';
import Departments       from './pages/admin/Departments';
import SetPassword from './pages/setPassword';
import CreateAdmin from './pages/admin/CreateAdmin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── public ── */}
          <Route path="/"                    element={<Navigate to="/login" replace />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register />} />
          <Route path="/doctor-register"     element={<DoctorRegister />} />
          <Route path="/doctor-setup/:token" element={<DoctorSetup />} />
          <Route path="/unauthorized"        element={<Unauthorized />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />


          {/* ── patient ── */}
          <Route path="/patient/dashboard"
            element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book"
            element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/appointments"
            element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/profile"
            element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />

          {/* ── doctor ── */}
          <Route path="/doctor/dashboard"
            element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments"
            element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/profile"
            element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/patients"
            element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />

          {/* ── admin ── */}
          <Route path="/admin/dashboard"
            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctor-requests"
            element={<ProtectedRoute roles={['admin']}><DoctorRequests /></ProtectedRoute>} />
          <Route path="/admin/doctors"
            element={<ProtectedRoute roles={['admin']}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/patients"
            element={<ProtectedRoute roles={['admin']}><ManagePatients /></ProtectedRoute>} />
          <Route path="/admin/appointments"
            element={<ProtectedRoute roles={['admin']}><AllAppointments /></ProtectedRoute>} />
          <Route path="/admin/users"
            element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/departments"
            element={<ProtectedRoute roles={['admin']}><Departments /></ProtectedRoute>} />
<Route path="/admin/create-admin"
            element={<ProtectedRoute roles={['admin']}><CreateAdmin /></ProtectedRoute>} />
          {/* ── catch all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}