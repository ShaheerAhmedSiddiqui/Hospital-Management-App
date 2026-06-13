import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, getDoctorProfile } from '../../services/api';
import { type Appointment } from '../../types';

interface DoctorProfile {
  _id: string;
  specialization: string;
  fees: number;
  experience: string;
  availableSlots: { day: string; startTime: string; endTime: string }[];
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAppointments(), getDoctorProfile()])
      .then(([apptRes, profRes]) => {
        setAppointments(apptRes.data);
        setProfile(profRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today);
  const pending    = appointments.filter(a => a.status === 'pending');
  const upcoming   = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const isComplete = profile && profile.fees > 0 && profile.availableSlots?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* greeting */}
        <div className="bg-teal-600 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-xl font-bold">Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]}</h1>
          <p className="text-teal-100 text-sm mt-1">{profile?.specialization}</p>
        </div>

        {/* profile incomplete warning */}
        {!loading && !isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6
                          flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p className="text-sm text-amber-800">
                Your profile setup (fee & availability) is pending admin configuration.
              </p>
            </div>
          </div>
        )}

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-20 mb-3"/>
                <div className="h-8 bg-gray-200 rounded w-12"/>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Today's appointments</p>
                <p className="text-3xl font-bold text-gray-900">{todayAppts.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Total appointments</p>
                <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Consultation fee</p>
                <p className="text-3xl font-bold text-teal-600">
                  {profile?.fees ? `PKR ${profile.fees}` : '—'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* today's appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Today's schedule</h2>
            <Link to="/doctor/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
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
          ) : todayAppts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map(a => (
                <div key={a._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-sm">
                      {a.patientId?.userId?.name?.[0] ?? 'P'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{a.patientId?.userId?.name ?? 'Patient'}</p>
                    <p className="text-xs text-gray-500">{a.time} {a.notes && `· ${a.notes}`}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* upcoming summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Upcoming appointments</h2>
            <Link to="/doctor/appointments" className="text-sm text-blue-600 hover:underline">Manage</Link>
          </div>

          {loading ? (
            <div className="h-20 bg-gray-50 rounded-xl animate-pulse"/>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No upcoming appointments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map(a => (
                <div key={a._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{a.patientId?.userId?.name ?? 'Patient'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.date).toLocaleDateString()} · {a.time}
                    </p>
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