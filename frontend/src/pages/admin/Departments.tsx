import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAllDepartments, createDepartment } from '../../services/api';

interface Department {
  _id:         string;
  name:        string;
  description: string;
  doctors:     string[];
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState({ name: '', description: '' });
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState('');

  const fetchDepts = () => {
    setLoading(true);
    getAllDepartments()
      .then(res => setDepartments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDepartment(form);
      showToast('Department created!');
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchDepts();
    } catch { showToast('Failed to create department.'); }
    finally { setSaving(false); }
  };

  const DEPT_COLORS = ['bg-blue-50 text-blue-700','bg-teal-50 text-teal-700',
    'bg-purple-50 text-purple-700','bg-amber-50 text-amber-700','bg-coral-50 text-coral-700'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-500 text-sm mt-1">{departments.length} departments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium
                       px-5 py-2.5 rounded-lg transition-colors">
            {showForm ? 'Cancel' : '+ Add department'}
          </button>
        </div>

        {/* create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">New department</h2>
            <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>
              <div className="flex-1 min-w-[280px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>
              <button type="submit" disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium
                           px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-32"/>
                <div className="h-3 bg-gray-200 rounded w-full"/>
                <div className="h-3 bg-gray-200 rounded w-20"/>
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="font-medium text-gray-500">No departments yet</p>
            <p className="text-sm mt-1">Click "Add department" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d, i) => (
              <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${DEPT_COLORS[i % DEPT_COLORS.length]}`}>
                  {d.name}
                </div>
                <p className="text-sm text-gray-500 mb-4">{d.description || 'No description provided.'}</p>
                <p className="text-xs text-gray-400">{d.doctors?.length ?? 0} doctor(s) assigned</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}