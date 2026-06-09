import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAppointments, cancelAppointment } from '../../services/api';
import { type Appointment } from '../../types/index';

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [toast,        setToast]        = useState('');

  const fetchAppts = () => {
    setLoading(true);
    getAppointments()
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      showToast('Appointment cancelled.');
      fetchAppts();
    } catch { showToast('Failed to cancel.'); }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total</p>
        </div>

        {/* filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-40"/>
                  <div className="h-3 bg-gray-200 rounded w-56"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {a.doctorId?.userId?.name ?? 'Doctor'}
                  </p>
                  <p className="text-sm text-gray-500">{a.doctorId?.specialization}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {/* ✅ Fixed: Changed a.date to a.appointmentDate and a.time to a.timeSlot */}
                    {new Date(a.appointmentDate).toLocaleDateString('en-PK', { dateStyle: 'medium' })} · {a.timeSlot}
                  </p>
                  {/* ✅ Fixed: Changed a.reason to a.notes since database tracks doctor notes */}
                  {a.notes && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2"><strong>Notes:</strong> {a.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status}
                  </span>
                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <button onClick={() => handleCancel(a._id)}
                      className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg
                                 font-medium transition-colors border border-red-100">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}