import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAppointments, updateApptStatus } from '../../services/api';
import { type Appointment } from '../../types';

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppts = () => {
    setLoading(true);
    getAppointments()
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateApptStatus(id, status);
      showToast(`Marked as ${status}`);
      fetchAppts();
    } catch { showToast('Failed to update status.'); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  // sort: pending first, then by date
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 py-8">

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
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f}
              {f === 'pending' && appointments.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
              )}
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
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(a => (
              <div key={a._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-lg">
                    {a.patientId?.userId?.name?.[0] ?? 'P'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{a.patientId?.userId?.name ?? 'Patient'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.date).toLocaleDateString('en-PK', { dateStyle: 'medium' })} · {a.time}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Reason:</span> {a.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status}
                  </span>

                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(a._id, 'confirmed')}
                        disabled={updating === a._id}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50
                                   hover:bg-green-100 text-green-700 transition-colors disabled:opacity-60">
                        Confirm
                      </button>
                      <button onClick={() => handleStatus(a._id, 'cancelled')}
                        disabled={updating === a._id}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50
                                   hover:bg-red-100 text-red-600 transition-colors disabled:opacity-60">
                        Decline
                      </button>
                    </>
                  )}

                  {a.status === 'confirmed' && (
                    <button onClick={() => handleStatus(a._id, 'completed')}
                      disabled={updating === a._id}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100
                                 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-60">
                      Mark completed
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