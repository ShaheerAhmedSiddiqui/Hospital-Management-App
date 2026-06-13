import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getDoctorProfile } from '../../services/api';

interface DoctorProfile {
  _id: string;
  specialization: string;
  fees: number;
  experience: string;
  qualification?: string;
  bio?: string;
  availableSlots: { day: string; startTime: string; endTime: string }[];
  departmentId?: { name: string };
}

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorProfile()
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  const isComplete = profile && profile.fees > 0 && profile.availableSlots?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My profile</h1>
          <p className="text-gray-500 text-sm mt-1">Your professional information</p>
        </div>

        {/* avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">{user?.name?.[0] ?? 'D'}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Dr. {user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {profile?.specialization && (
              <span className="inline-block mt-1 bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {profile.specialization}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32"/>
            <div className="h-4 bg-gray-200 rounded w-48"/>
            <div className="h-4 bg-gray-200 rounded w-40"/>
          </div>
        ) : !profile ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            Profile not found.
          </div>
        ) : (
          <>
            {/* profile incomplete notice */}
            {!isComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-sm text-amber-800">
                  Your fee and availability haven't been set up yet. Contact the admin to complete your profile setup.
                </p>
              </div>
            )}

            {/* professional info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <h2 className="font-semibold text-gray-900 mb-4">Professional information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Specialization</span>
                  <span className="text-sm font-medium text-gray-900">{profile.specialization}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Experience</span>
                  <span className="text-sm font-medium text-gray-900">{profile.experience || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Qualification</span>
                  <span className="text-sm font-medium text-gray-900">{profile.qualification || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-sm font-medium text-gray-900">{profile.departmentId?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Consultation fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.fees > 0 ? `PKR ${profile.fees}` : 'Not set'}
                  </span>
                </div>
              </div>
              {profile.bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* availability */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Availability</h2>
              {profile.availableSlots?.length === 0 ? (
                <p className="text-sm text-gray-400">No availability slots set.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.availableSlots.map((slot, i) => (
                    <div key={i} className="bg-teal-50 rounded-xl p-3 text-center">
                      <p className="text-sm font-semibold text-teal-800">{slot.day}</p>
                      <p className="text-xs text-teal-600 mt-0.5">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}