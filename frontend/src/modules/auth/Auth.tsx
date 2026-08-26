import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    setApiError(null);
    setApiSuccess(null);
    setIsLoading(true);

    try {
      if (role === 'Patient') {
        if (isLogin) {
          const res = await authApi.patientLogin(data.mobile, data.password);
          if (res.success && res.data) {
             login(res.data.token, res.data.role, res.data.userId);
             navigate('/patient/dashboard');
          }
        } else {
          const res = await authApi.patientRegister(data.mobile, data.password);
          if (res.success) {
             setApiSuccess("Registration successful. Please login.");
             setIsLogin(true);
             reset();
          }
        }
      } else {
         setApiError(`${role} authentication is not yet fully implemented on backend.`);
      }
    } catch (err: any) {
       console.error(err);
       if (err.response && err.response.data && err.response.data.message) {
           setApiError(err.response.data.message);
       } else {
           setApiError("An unexpected error occurred. Please try again.");
       }
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          SIH Hospital System
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Secure Access Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            {(['Patient', 'Doctor', 'Admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === r
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {(apiError || apiSuccess) && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${apiError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <AlertCircle className={`w-5 h-5 shrink-0 ${apiError ? 'text-red-500' : 'text-green-500'}`} />
              <p className="text-sm font-medium">{apiError || apiSuccess}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm">+91</span>
                </div>
                <input
                  {...register("mobile")}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.mobile ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                  placeholder="9999999999"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {role === 'Patient' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setApiError(null); setApiSuccess(null); reset(); }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
