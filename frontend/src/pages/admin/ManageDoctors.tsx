import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAllDoctors, toggleUserStatus } from '../../services/api';

interface Doctor {
  _id:            string;
  specialization: string;
  experience:     number;
  fee:            number;
  userId: {
    _id:      string;
    name:     string;
    email:    string;
    isActive: boolean;
  };
}

export default function ManageDoctors() {
  const [doctors, setDoctors]   = useState<Doctor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [toast,   setToast]     = useState('');

  const fetchDoctors = () => {
    setLoading(true);
    getAllDoctors()
      .then(res => setDoctors(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleToggle = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      showToast('Status updated.');
      fetchDoctors();
    } catch { showToast('Failed to update status.'); }
  };

  const filtered = doctors.filter(d =>
    d.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"/>
                    <div className="h-3 bg-gray-200 rounded w-24"/>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No doctors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => (
              <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-700 font-bold text-lg">
                        {d.userId?.name?.[0] ?? 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{d.userId?.name}</p>
                      <p className="text-xs text-gray-500">{d.userId?.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    d.userId?.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {d.userId?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Specialization</span>
                    <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {d.specialization}
                    </span>
                  </div>
                  {d.experience && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Experience</span>
                      <span className="text-gray-700">{d.experience} yrs</span>
                    </div>
                  )}
                  {d.fee > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fee</span>
                      <span className="text-gray-700">PKR {d.fee}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(d.userId?._id)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    d.userId?.isActive
                      ? 'bg-red-50 hover:bg-red-100 text-red-600'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
                  }`}>
                  {d.userId?.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}