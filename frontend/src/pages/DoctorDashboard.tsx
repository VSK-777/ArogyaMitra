import { Users, Clock, CheckCircle2 } from 'lucide-react';

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { title: 'Today\'s Patients', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Waiting in Queue', value: '4', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { title: 'Completed', value: '8', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Current Queue</h2>
          <span className="text-sm text-slate-500">Auto-refreshing</span>
        </div>
        <div className="divide-y divide-slate-200">
            <div className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-900">1. John Doe (Queue #14)</p>
                    <p className="text-sm text-slate-500 mt-1">Status: Ready. Waiting for 10 mins.</p>
                </div>
                <button className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md font-medium border border-blue-200 hover:bg-blue-100">
                    Call Patient
                </button>
            </div>
            <div className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-900">2. Alice Smith (Queue #15)</p>
                    <p className="text-sm text-slate-500 mt-1">Status: Triage Pending.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
