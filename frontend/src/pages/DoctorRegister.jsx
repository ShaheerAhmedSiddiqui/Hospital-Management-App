import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorRegisterReq } from '../services/api';

const SPECIALIZATIONS = [
  'Cardiologist','Neurologist','Orthopedic','Pediatrician',
  'Dermatologist','Gynecologist','Psychiatrist','General Physician',
];

export default function DoctorRegister() {
  const [form, setForm]       = useState({ name: '', email: '', address: '', specialization: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await doctorRegisterReq(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your registration request has been submitted. The admin will review it and
          you will receive an email with further instructions once approved.
        </p>
        <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">Back to login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0
                   01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Apply as a doctor</h1>
          <p className="text-gray-500 text-sm mt-1">Submit your details for admin approval</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* info banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <strong>How it works:</strong> Submit this form → Admin reviews your request →
            You receive an email with a link to set your password → You can then login.
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="Dr. Ahmed Khan"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Hospital address</label>
              <textarea name="address" value={form.address} onChange={handleChange} required rows={3}
                placeholder="123 Medical Street, Karachi"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium
                         py-2.5 rounded-lg transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500">
            Already approved? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}