import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAllDoctors, toggleUserStatus, updateDoctorProfile } from '../../services/api';

interface AvailabilitySlot {
  day:       string;
  startTime: string;
  endTime:   string;
}

interface Doctor {
  _id:            string;
  specialization: string;
  experience:     string;
  fees:           number;
  qualification?: string;
  bio?:           string;
  availableSlots: AvailabilitySlot[];
  userId: {
    _id:      string;
    name:     string;
    email:    string;
    isActive: boolean;
  };
}

interface ProfileForm {
  fees:          string;
  qualification: string;
  experience:    string;
  bio:           string;
  availableSlots: AvailabilitySlot[];
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const emptyForm = (): ProfileForm => ({
  fees:          '',
  qualification: '',
  experience:    '',
  bio:           '',
  availableSlots: [],
});

export default function ManageDoctors() {
  const [doctors,    setDoctors]    = useState<Doctor[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [toast,      setToast]      = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [forms,      setForms]      = useState<Record<string, ProfileForm>>({});
  const [saving,     setSaving]     = useState<string | null>(null);

  const fetchDoctors = () => {
    setLoading(true);
    getAllDoctors()
      .then(res => {
        const data: Doctor[] = res.data;
        setDoctors(data);
        const initial: Record<string, ProfileForm> = {};
        data.forEach(d => {
          initial[d._id] = {
            fees:          d.fees?.toString()        ?? '',
            qualification: d.qualification           ?? '',
            experience:    d.experience               ?? '',
            bio:           d.bio                      ?? '',
            availableSlots: d.availableSlots?.length
              ? d.availableSlots
              : [],
          };
        });
        setForms(initial);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggle = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      showToast('Status updated.');
      fetchDoctors();
    } catch { showToast('Failed to update status.'); }
  };

  const handleFormChange = (
    doctorId: string,
    field: keyof ProfileForm,
    value: string
  ) => {
    setForms(prev => ({
      ...prev,
      [doctorId]: { ...prev[doctorId], [field]: value },
    }));
  };

  const addSlot = (doctorId: string) => {
    setForms(prev => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        availableSlots: [
          ...prev[doctorId].availableSlots,
          { day: 'Mon', startTime: '09:00', endTime: '17:00' },
        ],
      },
    }));
  };

  const removeSlot = (doctorId: string, index: number) => {
    setForms(prev => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        availableSlots: prev[doctorId].availableSlots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSlot = (
    doctorId: string,
    index: number,
    field: keyof AvailabilitySlot,
    value: string
  ) => {
    setForms(prev => {
      const slots = [...prev[doctorId].availableSlots];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [doctorId]: { ...prev[doctorId], availableSlots: slots } };
    });
  };

  const handleSave = async (doctorId: string) => {
    const f = forms[doctorId];
    setSaving(doctorId);
    try {
      await updateDoctorProfile(doctorId, {
        fees:          Number(f.fees),
        qualification: f.qualification,
        experience:    f.experience,
        bio:           f.bio,
        availableSlots: f.availableSlots,
      });
      showToast('Doctor profile saved successfully!');
      setExpandedId(null);
      fetchDoctors();
    } catch { showToast('Failed to save profile.'); }
    finally { setSaving(null); }
  };

  const filtered = doctors.filter(d =>
    d.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm
                        px-4 py-3 rounded-xl shadow-lg transition-all">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage doctors</h1>
            <p className="text-gray-500 text-sm mt-1">{doctors.length} doctors registered</p>
          </div>
          <input
            type="text" placeholder="Search by name or specialization..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm w-72
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-40"/>
                    <div className="h-3 bg-gray-200 rounded w-56"/>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No doctors found</p>
          </div>

        ) : (
          <div className="space-y-4">
            {filtered.map(d => {
              const form       = forms[d._id] ?? emptyForm();
              const isOpen     = expandedId === d._id;
              const isSaving   = saving === d._id;
              const isComplete = d.fees > 0 && d.availableSlots?.length > 0 && d.experience !="" && d.qualification?.trim() !="" && d.bio?.trim() !="";

              return (
                <div key={d._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                             transition-all duration-200">

                  <div className="p-5 flex items-center gap-4 flex-wrap">

                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center
                                    justify-center flex-shrink-0">
                      <span className="text-teal-700 font-bold text-lg">
                        {d.userId?.name?.[0] ?? 'D'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{d.userId?.name}</p>
                        <span className="bg-teal-50 text-teal-700 text-xs font-medium
                                         px-2 py-0.5 rounded-full">
                          {d.specialization}
                        </span>
                        {isComplete ? (
                          <span className="bg-green-50 text-green-700 text-xs font-medium
                                           px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                            Profile complete
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-xs font-medium
                                           px-2 py-0.5 rounded-full">
                            ⚠ Profile incomplete
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{d.userId?.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        {d.fees > 0 && <span>PKR {d.fees}</span>}
                        {d.experience && <span>{d.experience} exp</span>}
                        {d.availableSlots?.length > 0 && (
                          <span>{d.availableSlots.length} slot(s)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleToggle(d.userId?._id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          d.userId?.isActive
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}>
                        {d.userId?.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => setExpandedId(isOpen ? null : d._id)}
                        className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors
                                    flex items-center gap-1.5 ${
                          isOpen
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}>
                        {isOpen ? 'Cancel' : 'Setup profile'}
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-700 mb-5">
                        Setup doctor profile for {d.userId?.name}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Consultation fee (PKR)
                          </label>
                          <input
                            type="number" min="0" placeholder="e.g. 2500"
                            value={form.fees}
                            onChange={e => handleFormChange(d._id, 'fees', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                       bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Experience
                          </label>
                          <input
                            type="text" placeholder="e.g. 10+ years"
                            value={form.experience}
                            onChange={e => handleFormChange(d._id, 'experience', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                       bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Qualification
                          </label>
                          <input
                            type="text" placeholder="e.g. MBBS, MD Cardiology"
                            value={form.qualification}
                            onChange={e => handleFormChange(d._id, 'qualification', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                       bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Bio
                            <span className="text-gray-400 font-normal ml-1">(optional)</span>
                          </label>
                          <input
                            type="text" placeholder="Brief professional description..."
                            value={form.bio}
                            onChange={e => handleFormChange(d._id, 'bio', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                       bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Available slots</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Patients can only book on these days and times
                            </p>
                          </div>
                          <button type="button" onClick={() => addSlot(d._id)}
                            className="text-xs font-medium text-purple-600 hover:text-purple-700
                                       bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg
                                       transition-colors flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                            Add slot
                          </button>
                        </div>

                        {form.availableSlots.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6
                                          text-center text-sm text-gray-400">
                            No slots added yet. Click "Add slot" to set availability.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {form.availableSlots.map((slot, idx) => (
                              <div key={idx}
                                className="flex items-center gap-3 bg-white border border-gray-200
                                           rounded-xl px-4 py-3 flex-wrap">

                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-500 w-8">Day</label>
                                  <select
                                    value={slot.day}
                                    onChange={e => updateSlot(d._id, idx, 'day', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm
                                               bg-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    {DAYS.map(day => (
                                      <option key={day} value={day}>{day}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-500">From</label>
                                  <input
                                    type="time" value={slot.startTime}
                                    onChange={e => updateSlot(d._id, idx, 'startTime', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm
                                               bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-500">To</label>
                                  <input
                                    type="time" value={slot.endTime}
                                    onChange={e => updateSlot(d._id, idx, 'endTime', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm
                                               bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  />
                                </div>

                                <button type="button" onClick={() => removeSlot(d._id, idx)}
                                  className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50
                                             p-1.5 rounded-lg transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-6 pt-5
                                      border-t border-gray-200">
                        <button type="button" onClick={() => setExpandedId(null)}
                          className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100
                                     rounded-lg transition-colors">
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(d._id)}
                          disabled={isSaving}
                          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white
                                     text-sm font-medium rounded-lg transition-colors
                                     disabled:opacity-60 disabled:cursor-not-allowed
                                     flex items-center gap-2">
                          {isSaving && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                          )}
                          {isSaving ? 'Saving...' : 'Save profile'}
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}