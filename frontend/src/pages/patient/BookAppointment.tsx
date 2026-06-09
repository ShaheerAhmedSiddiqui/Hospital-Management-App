import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getAllDoctors, bookAppointment } from '../../services/api';

interface Doctor {
  _id:            string;
  specialization: string;
  fee:            number;
  userId: { name: string };
  availability: { day: string; startTime: string; endTime: string }[];
}

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30',
                    '14:00','14:30','15:00','15:30','16:00','16:30'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors,  setDoctors]  = useState<Doctor[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [form,     setForm]     = useState({ date: '', time: '', reason: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getAllDoctors()
      .then(res => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true); setError('');
    try {
      await bookAppointment({ doctor: selected._id, ...form });
      navigate('/patient/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book an appointment</h1>
          <p className="text-gray-500 text-sm mt-1">Select a doctor and choose your preferred time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* doctor list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Choose a doctor
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-200 rounded w-32"/>
                      <div className="h-3 bg-gray-200 rounded w-20"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map(d => (
                  <div key={d._id}
                    onClick={() => setSelected(d)}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
                      selected?._id === d._id
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center
                                      justify-center flex-shrink-0">
                        <span className="text-teal-700 font-bold text-lg">
                          {d.userId?.name?.[0] ?? 'D'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{d.userId?.name}</p>
                        <p className="text-xs text-gray-500">{d.specialization}</p>
                        {d.fee > 0 && (
                          <p className="text-xs text-blue-600 font-medium mt-0.5">PKR {d.fee}</p>
                        )}
                      </div>
                      {selected?._id === d._id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* booking form */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Appointment details
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {!selected ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm">Select a doctor first</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  {/* selected doctor summary */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-2">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold">{selected.userId?.name?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selected.userId?.name}</p>
                      <p className="text-xs text-gray-500">{selected.specialization}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" required value={form.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} type="button"
                          onClick={() => setForm({ ...form, time: t })}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            form.time === t
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for visit</label>
                    <textarea rows={3} value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      placeholder="Briefly describe your symptoms..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                  </div>

                  <button type="submit" disabled={saving || !form.date || !form.time}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                               py-2.5 rounded-lg transition-colors disabled:opacity-60">
                    {saving ? 'Booking...' : 'Confirm appointment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}