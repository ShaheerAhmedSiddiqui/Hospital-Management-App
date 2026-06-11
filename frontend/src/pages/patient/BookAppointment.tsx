import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getAllDoctors, bookAppointment } from '../../services/api';
import {type Doctor} from '../../types/index'

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors,   setDoctors]   = useState<Doctor[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<Doctor | null>(null);
  const [form,      setForm]      = useState({ date: '', time: '', reason: '' });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    getAllDoctors()
      .then(res => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setError('Please select a doctor');
    if (!form.date)  return setError('Please select a date');
    if (!form.time)  return setError('Please select a time slot');

    setSaving(true); setError('');
    try {
      await bookAppointment({
        doctorId: selected._id,
        date:     form.date,
        time:     form.time,
        reason:   form.reason,
      });
      navigate('/patient/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = doctors.filter(d =>
    d.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book an appointment</h1>
          <p className="text-gray-500 text-sm mt-1">
            Choose a doctor and pick your preferred slot.
            {/* important UX note */}
            <span className="ml-1 text-blue-600 font-medium">
              Your patient profile is created automatically on your first booking.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── left: doctor list ── */}
          <div className="space-y-3">
            <input
              type="text" placeholder="Search doctor or specialization..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-32"/>
                    <div className="h-3 bg-gray-200 rounded w-20"/>
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                No doctors found
              </div>
            ) : (
              filtered.map(d => (
                <div key={d._id} onClick={() => { setSelected(d); setError(''); }}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
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
                      <div className="flex items-center gap-3 mt-1">
                        {d.experience && (
                          <span className="text-xs text-gray-400">{d.experience} yrs exp</span>
                        )}
                        {d.fee > 0 && (
                          <span className="text-xs font-medium text-blue-600">PKR {d.fee}</span>
                        )}
                      </div>
                    </div>
                    {selected?._id === d._id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── right: booking form ── */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {!selected ? (
                <div className="text-center py-14 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm">Select a doctor to continue</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-5">

                  {/* selected doctor summary */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold">{selected.userId?.name?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selected.userId?.name}</p>
                      <p className="text-xs text-gray-500">{selected.specialization}</p>
                    </div>
                    <button type="button" onClick={() => setSelected(null)}
                      className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">
                      ×
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date
                    </label>
                    <input type="date" required value={form.date} min={today}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>

                  {/* time slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Time slot
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} type="button"
                          onClick={() => setForm({ ...form, time: t })}
                          className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                            form.time === t
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reason for visit
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <textarea rows={3} value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      placeholder="Briefly describe your symptoms or reason..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                  </div>

                  {/* fee notice */}
                  {selected.fee > 0 && (
                    <div className="flex items-center justify-between text-sm p-3
                                    bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500">Consultation fee</span>
                      <span className="font-semibold text-gray-900">PKR {selected.fee}</span>
                    </div>
                  )}

                  <button type="submit" disabled={saving || !form.date || !form.time}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                               py-3 rounded-xl transition-colors disabled:opacity-50
                               disabled:cursor-not-allowed text-sm">
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