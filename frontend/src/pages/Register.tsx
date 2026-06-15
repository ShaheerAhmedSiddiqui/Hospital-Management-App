import { useState } from 'react';
import { Link } from 'react-router-dom';
import { startRegistration } from '../services/api'; // 🧠 Using the new multi-step API

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks if mail has been dispatched

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    
    try {
      // Send only name and email to initiate verification sequence
      await startRegistration({ name: form.name, email: form.email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed to start.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full name',     name: 'name',  type: 'text',  placeholder: 'Ali Khan' },
    { label: 'Email address', name: 'email', type: 'email', placeholder: 'you@example.com' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create patient account</h1>
          <p className="text-gray-500 text-sm mt-1">Verify your identity to secure your dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {isSubmitted ? (
            // Success Card State
            <div className="text-center space-y-3">
              <div className="text-4xl">📩</div>
              <h3 className="text-lg font-semibold text-gray-900">Verify your email</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We sent a secure validation link to <strong className="text-gray-800">{form.email}</strong>. 
                Please open your inbox and click the link to configure your password.
              </p>
              <div className="pt-2">
                <Link to="/login" className="text-sm text-blue-600 hover:underline font-medium">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            // Active Form State
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type} name={f.name} value={(form as any)[f.name]}
                      onChange={handleChange} required placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                             py-2.5 rounded-lg transition-colors disabled:opacity-60 mt-4">
                  {loading ? 'Sending verification...' : 'Send Verification Link'}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}