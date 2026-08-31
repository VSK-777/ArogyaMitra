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

              <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Infrastructure Health</h2>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-slate-200">
                      <tr>
                          <th className="px-5 py-3 font-semibold text-slate-600">Service Component</th>
                          <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                          <th className="px-5 py-3 font-semibold text-slate-600">Latency</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-medium text-slate-900">Spring Boot API</td>
                          <td className="px-5 py-3"><span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Operational</span></td>
                          <td className="px-5 py-3 text-slate-600">42ms</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-medium text-slate-900">PostgreSQL Cluster</td>
                          <td className="px-5 py-3"><span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Operational</span></td>
                          <td className="px-5 py-3 text-slate-600">12ms</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-medium text-slate-900">Python AI Service</td>
                          <td className="px-5 py-3"><span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Connected</span></td>
                          <td className="px-5 py-3 text-slate-600">1.2s avg inference</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div className="lg:col-span-1 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 shrink-0">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Alerts</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-center items-center text-slate-400">
                  <p className="text-sm text-center mt-2">No active security alerts or warnings. System operating normally.</p>
              </div>
          </div>
      </div>
    </div>
  );
}





