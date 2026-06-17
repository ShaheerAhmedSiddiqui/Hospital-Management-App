import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserRole = 'patient' | 'doctor' | 'admin';

interface NavLinkItem {
  to: string;
  label: string;
}

const NAV_LINKS: Record<UserRole, NavLinkItem[]> = {
  patient: [
    { to: '/patient/dashboard',     label: 'Dashboard' },
    { to: '/patient/book',          label: 'Book appointment' },
    { to: '/patient/appointments', label: 'My appointments' },
    { to: '/patient/profile',      label: 'Profile' },
  ],
  doctor: [
    { to: '/doctor/dashboard',    label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/patients',     label: 'My patients' },
    { to: '/doctor/profile',      label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard',       label: 'Dashboard' },
    { to: '/admin/doctor-requests', label: 'Doctor requests' },
    { to: '/admin/doctors',         label: 'Doctors' },
    { to: '/admin/patients',        label: 'Patients' },
    { to: '/admin/appointments',    label: 'Appointments' },
    { to: '/admin/users',           label: 'Users' },
  ],
};

const ROLE_COLOR: Record<UserRole, string> = { 
  admin: 'bg-purple-600', 
  doctor: 'bg-teal-600', 
  patient: 'bg-blue-600' 
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role as UserRole | undefined;
  
  const links = userRole ? NAV_LINKS[userRole] : [];
  const currentBadgeColor = userRole ? ROLE_COLOR[userRole] : 'bg-gray-400';

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* logo */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${currentBadgeColor} rounded-lg flex items-center justify-center`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">MediCare</span>
          </div>

          {/* links */}
          <div className="hidden md:flex items-center gap-1">
            {}
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900
                           hover:bg-gray-100 transition-colors font-medium">
                {l.label}
              </Link>
            ))}
          </div>

          {/* user + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50
                         rounded-lg transition-colors font-medium">
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}