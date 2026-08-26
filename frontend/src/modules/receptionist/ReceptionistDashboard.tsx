import { useState } from 'react';
import { Search, UserPlus, FileText, Loader2 } from 'lucide-react';
import { receptionistApi } from '../../api/receptionistApi';

export default function ReceptionistDashboard() {
  const [mobile, setMobile] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          const res = await receptionistApi.searchPatient(mobile);
          if (res.success && res.data) {
              setPatient(res.data);
          } else {
              setPatient(null);
              setError("Patient not found. Please register new patient.");
          }
      } catch (err: any) {
          setPatient(null);
          setError("Patient not found. Please register new patient.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Receptionist Desk</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Find Patient</h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                  <input value={mobile} onChange={e=>setMobile(e.target.value)} type="text" placeholder="Mobile Number" className="flex-1 border p-2 rounded" />
                  <button disabled={loading} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      Search
                  </button>
              </form>
              {error && <div className="mt-4 bg-orange-50 text-orange-700 p-3 rounded">{error}</div>}
              
              {patient && (
                  <div className="mt-6 border border-green-200 bg-green-50 p-4 rounded-lg">
                      <h3 className="font-bold text-green-900">Patient Found</h3>
                      <p className="text-sm text-green-800">Name: {patient.fullName}</p>
                      <p className="text-sm text-green-800">ID: {patient.patientId}</p>
                      
                      <div className="mt-4 flex gap-2">
                          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Generate Token (Walk-in)</button>
                          <button className="bg-white text-green-700 border border-green-600 px-4 py-2 rounded text-sm hover:bg-green-50">View Appointments</button>
                      </div>
                  </div>
              )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Quick Registration</h2>
              <div className="space-y-4 text-sm">
                  <p className="text-slate-500">Register a new walk-in patient who does not have an account.</p>
                  <input type="text" placeholder="Full Name" className="w-full border p-2 rounded" />
                  <input type="text" placeholder="Mobile Number" className="w-full border p-2 rounded" />
                  <input type="date" placeholder="Date of Birth" className="w-full border p-2 rounded" />
                  <button className="w-full bg-slate-800 text-white px-4 py-2 rounded font-bold hover:bg-slate-900">Register & Generate Token</button>
              </div>
          </div>
      </div>
    </div>
  );
}
