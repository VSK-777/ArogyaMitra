import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Play, Key, Trash2, Clock, CheckCircle2, XCircle, ChevronRight, Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common['Content-Type'] = 'application/json';

interface ApiEndpoint {
  id: string;
  module: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  defaultBody?: any;
}

const ENDPOINTS: ApiEndpoint[] = [
  { id: 'auth-register', module: 'Authentication', name: 'Register Patient', method: 'POST', path: '/api/auth/patient/register', description: 'Registers a new patient with mobile and password.', requiresAuth: false, defaultBody: { mobile: "9951117631", password: "Patient@123" } },
  { id: 'auth-login', module: 'Authentication', name: 'Login Patient', method: 'POST', path: '/api/auth/patient/login', description: 'Logs in a patient and returns a JWT token.', requiresAuth: false, defaultBody: { mobile: "9951117631", password: "Patient@123" } },
  { id: 'hospitals-list', module: 'Hospitals', name: 'Get All Hospitals', method: 'GET', path: '/api/public/hospitals', description: 'Retrieves a list of all hospitals.', requiresAuth: false },
  { id: 'departments-list', module: 'Hospitals', name: 'Get Departments by Hospital', method: 'GET', path: '/api/public/hospitals/1/departments', description: 'Retrieves departments for a specific hospital (ID: 1).', requiresAuth: false },
  { id: 'doctors-list', module: 'Hospitals', name: 'Get Doctors by Department', method: 'GET', path: '/api/public/departments/1/doctors', description: 'Retrieves doctors for a specific department (ID: 1).', requiresAuth: false },
  { id: 'appointments-create', module: 'Appointments', name: 'Create Appointment', method: 'POST', path: '/api/appointments', description: 'Creates a new appointment for the authenticated patient.', requiresAuth: true, defaultBody: { doctorId: 1, hospitalId: 1, departmentId: 1, reason: "General checkup", appointmentType: "REGULAR" } },
  { id: 'appointments-patient', module: 'Appointments', name: 'Get Patient Appointments', method: 'GET', path: '/api/appointments/patient', description: 'Retrieves all appointments for the authenticated patient.', requiresAuth: true },
  { id: 'pre-consultation-submit', module: 'Pre-Consultation', name: 'Submit Pre-consultation', method: 'POST', path: '/api/pre-consultation/1', description: 'Submits pre-consultation details for appointment ID 1.', requiresAuth: true, defaultBody: { chiefComplaint: "Headache for 2 days", symptoms: "Fever, nausea", associatedSymptoms: "Light sensitivity", patientConcerns: "Worried it might be a migraine", medicalHistory: "None", previousConditions: "None", allergies: "None", medications: "Paracetamol" } }
];

export default function ApiTesting() {
  const [token, setToken] = useState<string>(localStorage.getItem('auth_token') || '');
  const [activeTab, setActiveTab] = useState<string>('Authentication');
  const [results, setResults] = useState<Record<string, { status: number; statusText: string; data: any; time: number; isError: boolean; }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [requestBodies, setRequestBodies] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    ENDPOINTS.forEach(ep => { if (ep.defaultBody) initial[ep.id] = JSON.stringify(ep.defaultBody, null, 2); });
    return initial;
  });

  const modules = Array.from(new Set(ENDPOINTS.map(e => e.module)));

  const handleTokenSave = (newToken: string) => {
    setToken(newToken);
    if (newToken) localStorage.setItem('auth_token', newToken);
    else localStorage.removeItem('auth_token');
  };

  const executeRequest = async (endpoint: ApiEndpoint) => {
    setLoading(prev => ({ ...prev, [endpoint.id]: true }));
    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (endpoint.requiresAuth && token) headers['Authorization'] = "Bearer " + token;
      let requestData = undefined;
      if (['POST', 'PUT'].includes(endpoint.method)) {
        try { requestData = JSON.parse(requestBodies[endpoint.id] || '{}'); } 
        catch (e) { alert('Invalid JSON in request body'); setLoading(prev => ({ ...prev, [endpoint.id]: false })); return; }
      }
      const response = await axios({ method: endpoint.method, url: endpoint.path, headers, data: requestData });
      const endTime = performance.now();
      setResults(prev => ({ ...prev, [endpoint.id]: { status: response.status, statusText: response.statusText, data: response.data, time: Math.round(endTime - startTime), isError: false } }));
      if (endpoint.id === 'auth-login' && response.data?.data?.token) handleTokenSave(response.data.data.token);
    } catch (error) {
      const endTime = performance.now();
      const err = error as AxiosError;
      setResults(prev => ({ ...prev, [endpoint.id]: { status: err.response?.status || 0, statusText: err.response?.statusText || 'Network Error', data: err.response?.data || err.message, time: Math.round(endTime - startTime), isError: true } }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.id]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            API Testing Console
          </h1>
          <p className="mt-2 text-slate-600">Developer tool to verify Spring Boot backend endpoints.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-500 mr-2">Backend URL:</span>
          <code className="text-sm text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded">{API_BASE}</code>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Key className="mr-2 h-5 w-5 text-slate-500" />
            Authentication State
          </h2>
          {token && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Authenticated</span>}
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">JWT Bearer Token</label>
          <div className="flex space-x-3">
            <input type="text" value={token} onChange={(e) => handleTokenSave(e.target.value)} placeholder="Paste JWT token here or generate via Verify OTP endpoint..." className="flex-grow px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
            <button onClick={() => handleTokenSave('')} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 flex items-center" title="Clear Token"><Trash2 className="h-4 w-4" /></button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Token is automatically injected into headers for endpoints requiring authentication.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">Modules</div>
            <ul className="divide-y divide-slate-100">
              {modules.map(module => (
                <li key={module}>
                  <button onClick={() => setActiveTab(module)} className={"w-full text-left px-4 py-3 flex items-center justify-between transition-colors " + (activeTab === module ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                    {module}
                    <ChevronRight className={"h-4 w-4 " + (activeTab === module ? 'text-blue-500' : 'text-slate-300')} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          {ENDPOINTS.filter(ep => ep.module === activeTab).map(endpoint => (
            <div key={endpoint.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={"px-2 py-1 rounded text-xs font-bold " + (endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' : endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700')}>
                      {endpoint.method}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{endpoint.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                    <code className="text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{endpoint.path}</code>
                    {endpoint.requiresAuth && (<span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"><Key className="h-3 w-3 mr-1" /> Auth Required</span>)}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{endpoint.description}</p>
                </div>
                <button onClick={() => executeRequest(endpoint)} disabled={loading[endpoint.id]} className={"flex-shrink-0 flex items-center px-5 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm " + (loading[endpoint.id] ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')}>
                  {loading[endpoint.id] ? (<span className="flex items-center"><div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Sending...</span>) : (<span className="flex items-center"><Play className="mr-2 h-4 w-4 fill-current" /> Send Request</span>)}
                </button>
              </div>

              {['POST', 'PUT'].includes(endpoint.method) && (
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Request Body (JSON)</label>
                  <textarea value={requestBodies[endpoint.id] || ''} onChange={(e) => setRequestBodies(prev => ({ ...prev, [endpoint.id]: e.target.value }))} className="w-full h-32 px-4 py-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white" />
                </div>
              )}

              {results[endpoint.id] && (
                <div className="px-6 py-4 bg-slate-900 text-slate-300 overflow-x-auto">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
                    <div className="flex items-center space-x-4 text-sm font-medium">
                      <span className={"flex items-center px-2 py-1 rounded " + ((results[endpoint.id].isError || results[endpoint.id].status >= 400) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400')}>
                        {(results[endpoint.id].isError || results[endpoint.id].status >= 400) ? <XCircle className="h-4 w-4 mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                        {results[endpoint.id].status} {results[endpoint.id].statusText}
                      </span>
                      <span className="flex items-center text-slate-400"><Clock className="h-4 w-4 mr-1.5" /> {results[endpoint.id].time} ms</span>
                    </div>
                  </div>
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(results[endpoint.id].data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
