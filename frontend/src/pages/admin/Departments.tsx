import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAllUsers } from '../../services/api'; // 🟥 Removed toggleUserStatus
import type { User } from '../../types';

const ROLE_STYLE: Record<string, string> = {
  admin:  'bg-purple-50 text-purple-700',
  doctor: 'bg-teal-50 text-teal-700',
  patient:'bg-blue-50 text-blue-700',
};

export default function ManageUsers() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('all');

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = role === 'all' || u.role === role;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text" placeholder="Search name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm flex-1 min-w-[200px]
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-50 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"/>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-40"/>
                  <div className="h-3 bg-gray-200 rounded w-56"/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">User</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Role</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-16 text-gray-400">No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-700 font-semibold text-sm">{u.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {/* ✅ Safely render the auto-generated timestamp field */}
                      {(u as any).createdAt 
                        ? new Date((u as any).createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' }) 
                        : '—'
                      }
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