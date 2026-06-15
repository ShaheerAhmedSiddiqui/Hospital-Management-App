import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { updatePatientProfile } from '../../services/api'; 

export default function PatientProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state initialized with optional chaining fallbacks
  const [form, setForm] = useState({
    name:        user?.name ?? '',
    email:       user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    gender:      user?.gender ?? '',
    address:     user?.address ?? '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });

  // Sync form state if the user object loads asynchronously or updates
  useEffect(() => {
    if (user) {
      setForm({
        name:        user.name ?? '',
        email:       user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        gender:      user.gender ?? '',
        address:     user.address ?? '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const showToast = (msg: string) => { 
    setToast(msg); 
    setTimeout(() => setToast(''), 3000); 
  };

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setSaving(true);
  try {
    // No IDs passed here anymore—the token takes care of it
    await updatePatientProfile(form);
    
    setEditing(false);
    showToast('Profile updated successfully!');
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Failed to update profile.');
  } finally {
    setSaving(false);
  }
};

  // Structured list for clean read-only display
  const displayFields = [
    { label: 'Full name',     value: form.name || '—' },
    { label: 'Email',         value: form.email || '—' },
    { label: 'Phone',         value: form.phoneNumber || '—' },
    { label: 'Gender',        value: form.gender || '—' },
    { label: 'Date of Birth', value: form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—' },
    { label: 'Address',       value: form.address || '—' },
  ];

  // Config mapping blueprint to render form inputs without duplicated JSX tags
  const formFields = [
    { label: 'Full name',     name: 'name',        type: 'text',     element: 'input' },
    { label: 'Email',         name: 'email',       type: 'email',    element: 'input' },
    { label: 'Phone',         name: 'phoneNumber', type: 'tel',      element: 'input' },
    { label: 'Date of Birth', name: 'dateOfBirth', type: 'date',     element: 'input' },
    { label: 'Gender',        name: 'gender',      element: 'select', options: ['Male', 'Female', 'Other'] },
    { label: 'Address',       name: 'address',     element: 'textarea' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Toast Notification Element */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg transition-all duration-300">
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
        </div>

        {/* Profile Avatar Banner Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-white font-bold text-2xl">{form.name?.[0] ?? 'P'}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{form.name || 'Patient Profile'}</p>
            <p className="text-gray-500 text-sm">{form.email}</p>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
              {user?.role || 'patient'}
            </span>
          </div>
        </div>

        {/* Main Panel Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Personal information</h2>
            {!editing && (
              <button 
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            /* Read-Only Mode Grid Layout */
            <div className="space-y-4">
              {displayFields.map(f => (
                <div key={f.label} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
                  <span className="text-sm text-gray-500 flex-shrink-0">{f.label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-md break-words">{f.value}</span>
                </div>
              ))}
            </div>
          ) : (
            /* Editing State Dynamic Form Element Block */
            <form onSubmit={handleSave} className="space-y-4">
              {formFields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  
                  {f.element === 'input' && (
                    <input 
                      type={f.type} 
                      value={(form as any)[f.name]}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                      required={f.name === 'name' || f.name === 'email'}
                    />
                  )}

                  {f.element === 'select' && (
                    <select
                      value={(form as any)[f.name]}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select Gender</option>
                      {f.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {f.element === 'textarea' && (
                    <textarea
                      rows={3}
                      value={(form as any)[f.name]}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                      placeholder="Enter your complete residential address..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    />
                  )}
                </div>
              ))}

              {/* Form Actions Trigger Row */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-6">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button 
                  type="button" 
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    // Rollback current view mutations to mirror existing state context
                    if (user) {
                      setForm({
                        name:        user.name ?? '',
                        email:       user.email ?? '',
                        phoneNumber: user.phoneNumber ?? '',
                        gender:      user.gender ?? '',
                        address:     user.address ?? '',
                        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                      });
                    }
                  }}
                  className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
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