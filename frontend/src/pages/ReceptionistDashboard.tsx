export default function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Receptionist / Admin Dashboard</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600 mb-4">Manage hospital walk-in appointments, assign queues, and override triage priority manually.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold text-slate-900 mb-2">Register Walk-in Patient</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Register Now</button>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold text-slate-900 mb-2">View Live Queues</h3>
                <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 text-sm">Open Monitor</button>
            </div>
        </div>
      </div>
    </div>
  );
}
