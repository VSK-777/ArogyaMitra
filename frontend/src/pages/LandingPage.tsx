import { Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <Stethoscope className="w-20 h-20 text-blue-600 mb-6" />
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">The Future of Hospital Management</h1>
            <p className="text-xl text-slate-600 max-w-2xl mb-10">AI-powered pre-consultations, intelligent queue management, and seamless digital healthcare records all in one place.</p>
            <div className="flex gap-4">
                <button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1">
                    Enter Portal
                </button>
            </div>
        </div>
    )
}
