import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAppointments } from '../../services/api';

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const past     = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* greeting */}
        <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-blue-100 text-sm mt-1">How are you feeling today?</p>
          <Link to="/patient/book"
            className="inline-block mt-4 bg-white text-blue-600 font-semibold
                       text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
            Book an appointment
          </Link>
        </div>

        {/* quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total',    value: appointments.length,  color: 'text-gray-900' },
            { label: 'Upcoming', value: upcoming.length,      color: 'text-blue-600' },
            { label: 'Completed',value: past.filter(a => a.status === 'completed').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Upcoming appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-32"/>
                    <div className="h-3 bg-gray-200 rounded w-48"/>
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No upcoming appointments.</p>
              <Link to="/patient/book" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                Book one now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map(a => (
                <div key={a._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{a.doctor?.userId?.name || 'Doctor'}</p>
                    <p className="text-xs text-gray-500">{a.doctor?.specialization} · {a.time} · {new Date(a.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}