import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getDashboardStats, getDoctorRequests } from '../../services/api';
import type { DashboardStats, DoctorRequest } from '../../types';

// ✅ Fixed: Explicitly typed the props interface for the StatCard component
interface StatCardProps {
  label: string;
  value: number | undefined | null;
  color: string;
  onClick?: () => void;
}

const StatCard = ({ label, value, color, onClick }: StatCardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 
                ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
  >
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // ✅ Fixed: Properly initialized states inside the component using generics
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getDoctorRequests()])
      .then(([s, r]) => { 
        setStats(s.data); 
        setRequests(r.data); 
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Filtering on the frontend to only show actual "pending" submissions
  const pendingRequests = requests.filter(r => r.approvalStatus === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital overview and management</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-20 mb-3"/>
                <div className="h-8 bg-gray-200 rounded w-12"/>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total users"     value={stats?.totalUsers}        color="text-gray-900" />
            <StatCard label="Doctors"         value={stats?.totalDoctors}      color="text-teal-600"
              onClick={() => navigate('/admin/doctors')} />
            <StatCard label="Patients"        value={stats?.totalPatients}     color="text-blue-600"
              onClick={() => navigate('/admin/patients')} />
            <StatCard label="Appointments"    value={stats?.totalAppointments} color="text-purple-600"
              onClick={() => navigate('/admin/appointments')} />
          </div>
        )}

        {/* Pending Doctor Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pending doctor requests</h2>
              <p className="text-sm text-gray-500">Doctors waiting for approval</p>
            </div>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                {pendingRequests.length} pending
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-sm font-medium text-gray-500">No pending requests</p>
              <p className="text-xs text-gray-400 mt-0.5">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-3 px-4 text-gray-500 font-medium">Name</th>
                    <th className="py-3 px-4 text-gray-500 font-medium">Email</th>
                    <th className="py-3 px-4 text-gray-500 font-medium">Specialization</th>
                    <th className="py-3 px-4 text-gray-500 font-medium">Submitted</th>
                    <th className="py-3 px-4 text-gray-500 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(r => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{r.name}</td>
                      <td className="py-3 px-4 text-gray-500">{r.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">
                          {r.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/admin/doctor-requests')}
                          className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium transition-colors">
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}