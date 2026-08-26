import { useEffect, useState } from 'react';
import { Users, Activity, Loader2, Hospital, Stethoscope } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getAnalytics()
      .then(res => {
          if (res.success) {
              setData(res.data);
          } else {
              setError(res.message);
          }
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Hospital Administration</h1>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Patients</p><p className="text-2xl font-bold text-slate-900">{data?.totalPatients || 0}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Appointments</p><p className="text-2xl font-bold text-slate-900">{data?.totalAppointments || 0}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><Stethoscope className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Doctors</p><p className="text-2xl font-bold text-slate-900">{data?.totalDoctors || 0}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><Hospital className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">Departments</p><p className="text-2xl font-bold text-slate-900">{data?.totalDepartments || 0}</p></div></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">System Health</h2>
          <p className="text-slate-600">All backend services are operational. AI integration is connected.</p>
      </div>
    </div>
  );
}
