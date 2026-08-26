import { useNavigate } from 'react-router-dom';
import { Hospital } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Hospital className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Hospital Management System</h2>
        <div className="mt-8">
          <button onClick={() => navigate('/auth')} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Login to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
