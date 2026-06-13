import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAppointments } from '../../services/api';
import { type Appointment } from '../../types';

interface PatientSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalVisits: number;
  lastVisit: string;
  upcoming: boolean;
}

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAppointments()
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  // group appointments by patient
  const patientMap = new Map<string, PatientSummary>();
  appointments.forEach(a => {
    const id = a.patientId?.userId?._id ?? a.patientId?._id;
    if (!id) return;

    const existing = patientMap.get(id);
    const isUpcoming = a.status === 'pending' || a.status === 'confirmed';

    if (existing) {
      existing.totalVisits += 1;
      if (new Date(a.date) > new Date(existing.lastVisit)) {
        existing.lastVisit = a.date;
      }
      if (isUpcoming) existing.upcoming = true;
    } else {
      patientMap.set(id, {
        id,
        name: a.patientId?.userId?.name ?? 'Patient',
        totalVisits: 1,
        lastVisit: a.date,
        upcoming: isUpcoming,
      });
    }
  });

  const patients = Array.from(patientMap.values())
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My patients</h1>
            <p className="text-gray-500 text-sm mt-1">{patients.length} unique patients</p>
          </div>
          <input
            type="text" placeholder="Search patient..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm w-64
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-40"/>
                  <div className="h-3 bg-gray-200 rounded w-56"/>
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-8a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <p className="font-medium text-gray-500">No patients yet</p>
            <p className="text-sm mt-1">Patients will appear here once they book appointments with you.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Total visits</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Last visit</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">{p.name[0]}</span>
                        </div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{p.totalVisits}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(p.lastVisit).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-4 px-6">
                      {p.upcoming ? (
                        <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          Upcoming visit
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                          No upcoming
                        </span>
                      )}
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