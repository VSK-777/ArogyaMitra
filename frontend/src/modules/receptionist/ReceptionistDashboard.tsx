import { useState } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { receptionistApi } from '../../api/receptionistApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

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

  const [regData, setRegData] = useState({ fullName: '', mobile: '', dateOfBirth: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setRegLoading(true);
      setRegMessage('');
      try {
          const res = await receptionistApi.registerPatient(regData);
          if (res.success) {
              setPatient(res.data);
              setRegMessage("Registration successful.");
              setRegData({ fullName: '', mobile: '', dateOfBirth: '' });
          } else {
              setRegMessage(res.message);
          }
      } catch (err: any) {
          setRegMessage(getUserFriendlyMessage(err));
      } finally {
          setRegLoading(false);
      }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Receptionist Desk</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Find Patient</h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                  <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g, ''))} type="text" pattern="\d{10}" maxLength={10} title="Mobile number must be exactly 10 digits" placeholder="Mobile Number (10 digits)" className="flex-1 border p-2 rounded" />
                  <button disabled={loading} type="submit" className="bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-800">
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
                      {patient.aadhaarNumber && (
                        <p className="text-sm text-green-800">Aadhaar: {patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</p>
                      )}
                      
                      <div className="mt-4 flex gap-2">
                          <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded">Profile Verified</span>
                      </div>
                  </div>
              )}
          </div>
          
          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Quick Registration</h2>
              <form onSubmit={handleRegister} className="space-y-4 text-sm">
                  <p className="text-slate-500">Register a new walk-in patient who does not have an account.</p>
                  <input required value={regData.fullName} onChange={e=>setRegData({...regData, fullName: e.target.value})} type="text" placeholder="Full Name" className="w-full border p-2 rounded" />
                  <input required value={regData.mobile} onChange={e=>setRegData({...regData, mobile: e.target.value.replace(/\D/g, '')})} type="text" pattern="\d{10}" maxLength={10} title="Mobile number must be exactly 10 digits" placeholder="Mobile Number (10 digits)" className="w-full border p-2 rounded" />
                  <input value={regData.dateOfBirth} onChange={e=>setRegData({...regData, dateOfBirth: e.target.value})} type="date" placeholder="Date of Birth" className="w-full border p-2 rounded" />
                  <button disabled={regLoading} type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded font-bold hover:bg-slate-900 disabled:opacity-50 flex justify-center gap-2 items-center">
                      {regLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Register Patient
                  </button>
                  {regMessage && <div className="p-2 text-center text-blue-700 bg-blue-50 rounded">{regMessage}</div>}
              </form>
          </div>
      </div>
    </div>
  );
}

