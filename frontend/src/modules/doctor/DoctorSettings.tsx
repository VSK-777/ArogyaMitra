import { useAuth } from '../../contexts/AuthContext';
import { User, Shield, Briefcase, Building } from 'lucide-react';

export default function DoctorSettings() {
    const { name, role, department, hospitalId } = useAuth();
    // Ideally we would fetch the doctor's full profile from the backend.
    // For now, we display the token details.

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-8 text-white flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-sm">
                        {name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'DR'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{name || 'Doctor Name'}</h2>
                        <p className="text-slate-300 font-medium flex items-center gap-2 mt-1">
                            <Shield className="h-4 w-4" /> {role} Account
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Professional Information</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-700"><User className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Full Name</p>
                                <p className="text-slate-900 font-medium">{name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-700"><Briefcase className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Department</p>
                                <p className="text-slate-900 font-medium">{department || 'Not Assigned'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-700"><Building className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Hospital ID</p>
                                <p className="text-slate-900 font-medium">{hospitalId ? `HOSP-${hospitalId}` : 'Not Assigned'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6 flex items-center justify-between">
                        <p className="text-sm text-blue-800 font-medium">Profile editing is currently managed by the Hospital Administrator.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

