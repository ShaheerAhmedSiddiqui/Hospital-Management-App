import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../services/api'; // Import your new method

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your administrator profile...');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Missing verification token.');
                return;
            }

            try {
                // Using the unified wrapper service method cleanly
                const response = await verifyEmailToken(token);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification link expired or invalid.');
            }
        };

        verifyToken();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl border border-gray-100 p-8 shadow-xl text-center">

                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <h2 className="text-xl font-bold text-gray-900">Validating Token</h2>
                        <p className="text-gray-500 text-sm">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 text-3xl font-bold">
                            ✓
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Account Activated</h2>
                        <p className="text-gray-500 text-sm px-2">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-colors text-sm"
                        >
                            Proceed to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 text-3xl font-bold">
                            ✕
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
                        <p className="text-red-500 text-sm px-2">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}