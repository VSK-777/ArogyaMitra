import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  fullName: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().optional(),
  isRegistering: z.boolean().optional()
}).superRefine((data, ctx) => {
  if (data.isRegistering) {
    if (!data.fullName || data.fullName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fullName'],
        message: "Full Name is required"
      });
    }
    if (!data.aadhaarNumber || !/^\d{12}$/.test(data.aadhaarNumber.replace(/\s/g, ''))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aadhaarNumber'],
        message: "Aadhaar number must be exactly 12 digits"
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: "Passwords do not match"
      });
    }
  }
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [role, setRole] = useState<'Patient' | 'Doctor' | 'Receptionist' | 'Admin'>('Patient');
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { isRegistering: false }
  });

  const onSubmit = async (data: AuthFormData) => {
    setApiError(null);
    setApiSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login(data.mobile, data.password, role);
        if (res.success && res.data) {
           login(res.data);
           // Role-based redirection from the actual backend response
           if (res.data.role === 'ROLE_DOCTOR') {
               navigate('/doctor/dashboard');
           } else if (res.data.role === 'ROLE_ADMIN') {
               navigate('/admin/dashboard');
           } else if (res.data.role === 'ROLE_RECEPTIONIST') {
               navigate('/receptionist/dashboard');
           } else {
               navigate('/patient/dashboard');
           }
        }
      } else {
        if (role === 'Patient') {
          const rawAadhaar = data.aadhaarNumber!.replace(/\s/g, '');
          const res = await authApi.patientRegister(data.mobile, data.password, data.fullName!, rawAadhaar);
          if (res.success) {
             setApiSuccess("Registration successful. Please login.");
             toggleMode();
          }
        } else {
          setApiError("Only patients can register here. Staff accounts are created by the Admin.");
        }
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

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    setValue('isRegistering', !newIsLogin);
    setApiError(null);
    setApiSuccess(null);
    reset({ isRegistering: !newIsLogin });
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
            {(['Patient', 'Doctor', 'Receptionist', 'Admin'] as const).map((r) => (
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
            
            {!isLogin && role === 'Patient' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register("fullName")}
                    className={`block w-full px-3 py-2 border ${errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                    placeholder="e.g. Vajjha Sai Krishna"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Aadhaar Number *
                      </label>
                      <input
                        {...register("aadhaarNumber", {
                          onChange: (e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                            e.target.value = formatted;
                          }
                        })}
                        className={`block w-full px-3 py-2 border ${errors.aadhaarNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                        placeholder="e.g. 1234 5678 9012"
                        maxLength={14}
                      />
                      {errors.aadhaarNumber && <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber.message}</p>}
                      <div className="mt-2 text-sm text-slate-500 flex items-center justify-between">
                        <span>Can't use the Aadhaar App? <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 font-medium hover:underline">Continue with Offline e-KYC</a></span>
                      </div>
                    </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm">+91</span>
                </div>
                <input
                  {...register("mobile", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    }
                  })}
                  maxLength={10}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.mobile ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                  placeholder="9999999999"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                {...register("password")}
                className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {!isLogin && role === 'Patient' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm sm:text-sm`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>

          {role === 'Patient' && (
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
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
