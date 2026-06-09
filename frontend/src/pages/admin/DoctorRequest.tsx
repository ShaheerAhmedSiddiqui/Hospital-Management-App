import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getDoctorRequests, approveDoctor, rejectDoctor } from '../../services/api';
import type { DoctorRequest } from '../../types';

// Style mapping for approval statuses
const APPROVAL_STYLE: Record<DoctorRequest['approvalStatus'], string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  registeration_approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  registeration_rejected: 'bg-red-50 text-red-700 border border-red-200',
  account_created: 'bg-blue-50 text-blue-700 border border-blue-200',
};

// Style mapping for email verification statuses
const EMAIL_STYLE: Record<DoctorRequest['emailStatus'], string> = {
  pending: 'bg-gray-100 text-gray-600',
  email_verified: 'bg-green-100 text-green-800',
  email_not_verified: 'bg-rose-100 text-rose-700',
};

export default function DoctorRequests() {
  const [requests, setRequests]           = useState<DoctorRequest[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal]     = useState<DoctorRequest | null>(null); 
  const [rejectReason, setRejectReason]   = useState('');
  const [toast, setToast]                 = useState('');

  const fetchRequests = () => {
    setLoading(true);
    getDoctorRequests()
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const showToast = (msg: string) => { 
    setToast(msg); 
    setTimeout(() => setToast(''), 3000); 
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve');
    try {
      await approveDoctor(id);
      showToast('Doctor approved! Setup email sent.');
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id + '_reject');
    try {
      await rejectDoctor(rejectModal._id, rejectReason);
      showToast('Request rejected.');
      setRejectModal(null); 
      setRejectReason('');
      fetchRequests();
    } catch { 
      showToast('Failed to reject'); 
    } finally { 
      setActionLoading(''); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject request</h3>
            <p className="text-sm text-gray-500 mb-4">Rejecting <strong>{rejectModal.name}</strong>. Optionally provide a reason.</p>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"/>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!!actionLoading}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg
                           transition-colors disabled:opacity-60">
                {actionLoading ? 'Rejecting...' : 'Confirm reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Doctor requests</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage incoming doctor registrations</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-40"/>
                    <div className="h-3 bg-gray-200 rounded w-60"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="font-medium text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-6
                                         flex flex-col sm:flex-row sm:items-center gap-4">
                {/* avatar */}
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold text-lg">{r.name ? r.name[0] : 'D'}</span>
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {r.specialization}
                    </span>
                    
                    {/* ✅ Fixed: Tracks approvalStatus field cleanly */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${APPROVAL_STYLE[r.approvalStatus]}`}>
                      {r.approvalStatus.replace(/_/g, ' ')}
                    </span>

                    {/* ✅ Bonus: Displays email status tracking */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${EMAIL_STYLE[r.emailStatus]}`}>
                      {r.emailStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{r.email}</p>
                  {r.address && <p className="text-xs text-gray-400 mt-0.5">{r.address}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted on {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '—'}
                  </p>
                </div>

                {/* actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* ✅ Fixed: Only show control actions if status is actually pending review */}
                  {r.approvalStatus === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(r._id)}
                        disabled={actionLoading === r._id + '_approve'}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm
                                   font-medium rounded-lg transition-colors disabled:opacity-60">
                        {actionLoading === r._id + '_approve' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejectModal(r)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm
                                   font-medium rounded-lg transition-colors">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic px-2 py-1">Processed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}