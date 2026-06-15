import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { completeRegistration } from '../services/api'; 

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage({ text: "Passwords do not match.", isError: true });
    }

    if (!token) {
      return setMessage({ text: "Missing security token. Please click the link from your email.", isError: true });
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // Swapped raw Axios for your cleaner global configuration instance setup
      const response = await completeRegistration({ token, password });

      setMessage({ text: response.data.message || "Password set successfully!", isError: false });
      setTimeout(() => navigate('/login'), 3000); 
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || "Something went wrong. Please request a new link.", 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  // Guard view: Alert users immediately if they navigated here without an email token link
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="text-red-500 text-3xl">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900">Invalid Token Link</h2>
          <p className="text-gray-500 text-sm">This page requires a secure validation token from your registration email.</p>
          <Link to="/register" className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">Go Back to Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Password</h2>
        <p className="text-gray-500 text-sm mb-6">Your email is verified! Set a password to complete your profile setup.</p>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors mt-2"
          >
            {loading ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}