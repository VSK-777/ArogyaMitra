import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Phone, Stethoscope, ShieldAlert } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Auth() {
  const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      if (role === 'Patient') {
        const endpoint = isLogin ? '/api/auth/patient/login' : '/api/auth/patient/register';
        const res = await axios.post(`${API_BASE_URL}${endpoint}`, { mobile, password });
        if (res.data.success) {
          if (isLogin && res.data.data?.token) {
            localStorage.setItem('jwt_token', res.data.data.token);
            localStorage.setItem('user_role', 'Patient');
            navigate('/patient/dashboard');
          } else {
            setIsLogin(true);
            setMsg('Registration successful. Please login.');
          }
        }
      } else {
        // Mock doctor/admin login for prototype completeness since we haven't built those backend auth endpoints yet
        if (mobile && password) {
           localStorage.setItem('user_role', role);
           localStorage.setItem('jwt_token', 'mock_token_123');
           navigate(`/${role.toLowerCase()}/dashboard`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 gap-4 mb-4">
            <button onClick={() => setRole('Patient')} className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 ${role === 'Patient' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'}`}>
              <User className="w-4 h-4" /> Patient
            </button>
            <button onClick={() => setRole('Doctor')} className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 ${role === 'Doctor' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'}`}>
              <Stethoscope className="w-4 h-4" /> Doctor
            </button>
            <button onClick={() => setRole('Admin')} className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 ${role === 'Admin' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'}`}>
              <ShieldAlert className="w-4 h-4" /> Admin
            </button>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {role} {isLogin ? 'Login' : 'Registration'}
        </h2>
        {role === 'Patient' && (
            <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                {isLogin ? 'register a new account' : 'login to an existing account'}
            </button>
            </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {error && <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-sm text-red-700">{error}</div>}
          {msg && <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md text-sm text-green-700">{msg}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number / User ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input required value={mobile} onChange={e => setMobile(e.target.value)} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
              </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
