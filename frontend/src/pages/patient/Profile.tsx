import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '', // ✅ Will now pass type validation smoothly
  });
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // wire to PATCH /api/users/me when ready
    setEditing(false);
    showToast('Profile updated!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
        </div>

        {/* avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">{user?.name?.[0] ?? 'P'}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* editable info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Personal information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:underline font-medium">
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              {[
                { label: 'Full name', value: user?.name },
                { label: 'Email',     value: user?.email },
                { label: 'Phone',     value: user?.phoneNumber || '—' },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{f.label}</span>
                  <span className="text-sm font-medium text-gray-900">{f.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: 'Full name', name: 'name',  type: 'text' },
                { label: 'Email',     name: 'email', type: 'email' },
                { label: 'Phone',     name: 'phoneNumber', type: 'tel' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
                  Save changes
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}