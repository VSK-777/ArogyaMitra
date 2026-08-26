import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Phone } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function PatientAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setToken('');

    const endpoint = isLogin ? '/api/auth/patient/login' : '/api/auth/patient/register';
    
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        mobile,
        password
      });

      if (response.data.success) {
        setMessage(response.data.message || (isLogin ? 'Login successful' : 'Registration successful'));
        if (isLogin && response.data.data?.token) {
          setToken(response.data.data.token);
          localStorage.setItem('jwt_token', response.data.data.token);
          // Redirect to patient dashboard
          window.location.href = '/patient/dashboard';
        }
        if (!isLogin) {
          setIsLogin(true);
          setPassword(''); // clear password for them to login
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
            <User className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Patient {isLogin ? 'Login' : 'Registration'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setMessage(''); setError(''); setToken(''); }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'register a new account' : 'login to an existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          {message && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                  <p className="text-sm text-green-700">{message}</p>
              </div>
          )}
          {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
              </div>
          )}
          {token && (
              <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded-md break-all">
                  <p className="text-xs text-blue-800 font-mono"><strong>JWT Token:</strong> {token}</p>
              </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  placeholder="e.g. 9999999999"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  placeholder="Minimum 8 characters"
                />
              </div>
              {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? 'Login' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
