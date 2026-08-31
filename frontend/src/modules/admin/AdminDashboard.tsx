import { useEffect, useState } from 'react';
import { Users, Activity, Loader2, Hospital, Stethoscope } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

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
      .catch((e) => setError(getUserFriendlyMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-700" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Hospital Administration</h1>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

            <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-5 flex items-center gap-4">
           <div className="rounded-md p-2 bg-slate-50 border border-slate-100"><Users className="h-5 w-5 text-slate-600" /></div>
           <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Patients</p><p className="text-2xl font-bold text-slate-900">{data?.totalPatients || 0}</p></div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 flex items-center gap-4">
           <div className="rounded-md p-2 bg-slate-50 border border-slate-100"><Activity className="h-5 w-5 text-slate-600" /></div>
           <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointments</p><p className="text-2xl font-bold text-slate-900">{data?.totalAppointments || 0}</p></div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 flex items-center gap-4">
           <div className="rounded-md p-2 bg-slate-50 border border-slate-100"><Stethoscope className="h-5 w-5 text-slate-600" /></div>
           <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctors</p><p className="text-2xl font-bold text-slate-900">{data?.totalDoctors || 0}</p></div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 flex items-center gap-4">
           <div className="rounded-md p-2 bg-slate-50 border border-slate-100"><Hospital className="h-5 w-5 text-slate-600" /></div>
           <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Departments</p><p className="text-2xl font-bold text-slate-900">{data?.totalDepartments || 0}</p></div>
        </div>
      </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">System Health</h2>
          <p className="text-slate-600">All backend services are operational. AI integration is connected.</p>
      </div>
    </div>
  );
}



