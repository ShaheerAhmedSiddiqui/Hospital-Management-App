import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAllPatients, toggleUserStatus } from '../../services/api';

interface Patient {
  _id:         string;
  gender?:     string;
  bloodType?:  string;
  dateOfBirth?: string;
  userId: {
    _id:      string;
    name:     string;
    email:    string;
    phone?:   string;
    isActive: boolean;
  };
}

export default function ManagePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState('');

  const fetchPatients = () => {
    setLoading(true);
    getAllPatients()
      .then(res => setPatients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleToggle = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      showToast('Status updated.');
      fetchPatients();
    } catch { showToast('Failed to update status.'); }
  };

  const filtered = patients.filter(p =>
    p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.userId?.email?.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">Manage patients</h1>
            <p className="text-gray-500 text-sm mt-1">{patients.length} patients registered</p>
          </div>
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm w-72
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-40"/>
                  <div className="h-3 bg-gray-200 rounded w-56"/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Blood type</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Gender</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-6 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400">No patients found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">
                            {p.userId?.name?.[0] ?? 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.userId?.name}</p>
                          <p className="text-xs text-gray-500">{p.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.bloodType
                        ? <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">{p.bloodType}</span>
                        : <span className="text-gray-400 text-xs">—</span>
                      }
                    </td>
                    <td className="py-4 px-6 text-gray-600 capitalize">{p.gender ?? '—'}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.userId?.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {p.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggle(p.userId?._id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          p.userId?.isActive
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}>
                        {p.userId?.isActive ? 'Deactivate' : 'Activate'}
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
  );
}