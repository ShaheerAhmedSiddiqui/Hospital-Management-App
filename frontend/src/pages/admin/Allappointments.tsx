import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAppointments, updateApptStatus } from '../../services/api';
import type { Appointment } from '../../types';

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function AllAppointments() {
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

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateApptStatus(id, status);
      showToast(`Status updated to ${status}`);
      fetchAppts();
    } catch { showToast('Failed to update status.'); }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total appointments</p>
        </div>

        {/* filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-48"/>
                  <div className="h-3 bg-gray-200 rounded w-64"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Doctor</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Date & time</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-6 text-gray-500 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {a.patientId?.userId?.name ?? '—'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{a.doctorId?.userId?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{a.doctorId?.specialization}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(a.date).toLocaleDateString()} · {a.appointmentDate}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={a.status}
                        onChange={e => handleStatus(a._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                                   focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}