import { Activity, Hospital, Building, FilePlus } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hospital Administration</h1>
      
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Hospital className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Hospitals</p><p className="text-2xl font-bold text-slate-900">1</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><Building className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">Departments</p><p className="text-2xl font-bold text-slate-900">8</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">System Status</p><p className="text-2xl font-bold text-green-600">Online</p></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FilePlus className="w-5 h-5"/> Quick Actions</h2>
            <div className="space-y-3">
               <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-slate-700">Add New Doctor Account</button>
               <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-slate-700">Add New Department</button>
               <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-slate-700">View System Audit Logs</button>
            </div>
         </div>
         <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
               <div className="text-sm"><span className="font-semibold text-slate-900">Dr. Sarah Jenkins</span> started queue processing. <span className="text-slate-500">10 mins ago</span></div>
               <div className="text-sm"><span className="font-semibold text-slate-900">Patient #99942</span> registered via Patient Portal. <span className="text-slate-500">22 mins ago</span></div>
               <div className="text-sm"><span className="font-semibold text-slate-900">System Admin</span> updated AI parameters. <span className="text-slate-500">1 hr ago</span></div>
            </div>
         </div>
      </div>
    </div>
  );
}
