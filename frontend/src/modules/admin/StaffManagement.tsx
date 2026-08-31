import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Loader2, Users, Stethoscope } from 'lucide-react';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

export default function StaffManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            adminApi.getUsers(),
            adminApi.getDoctors()
        ]).then(([usersRes, doctorsRes]) => {
            if (usersRes.success) setUsers(usersRes.data || []);
            else toast.error(usersRes.message);

            if (doctorsRes.success) setDoctors(doctorsRes.data || []);
            else toast.error(doctorsRes.message);
        }).catch(e => {
            setError(getUserFriendlyMessage(e));
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-700" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Users List */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-2 bg-slate-50">
                        <Users className="w-5 h-5 text-slate-500" />
                        <h2 className="text-lg font-semibold text-slate-900">System Users</h2>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {users.map(u => (
                            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <p className="font-bold text-slate-900">{u.name}</p>
                                    <p className="text-sm text-slate-500">{u.mobile}</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                    {u.role.replace('ROLE_', '')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Doctors List */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-2 bg-slate-50">
                        <Stethoscope className="w-5 h-5 text-slate-500" />
                        <h2 className="text-lg font-semibold text-slate-900">Medical Staff (Doctors)</h2>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {doctors.map(d => (
                            <div key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <p className="font-bold text-slate-900">{d.name}</p>
                                    <p className="text-sm text-slate-500">{d.specialization} | Dept ID: {d.department?.id || 'None'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


