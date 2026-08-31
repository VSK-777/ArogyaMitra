import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../api/client";

export default function ReassignmentManager() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [affectedAppointments, setAffectedAppointments] = useState<any[]>([]);
    const [replacements, setReplacements] = useState<any[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        // Fetch all doctors for the dropdown
        apiClient.get("/api/admin/doctors").then((res: any) => {
            if (res.data.success) {
                // Map to match the expected UI fields
                const formatted = res.data.data.map((d: any) => ({
                    doctorId: d.id,
                    name: d.user?.name,
                    department: d.department?.name
                }));
                setDoctors(formatted);
            }
        });
    }, []);

    const markUnavailable = async () => {
        if (!selectedDoctor || !date || !reason) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.post(`/api/reassignment/mark-unavailable?doctorId=${selectedDoctor}&date=${date}&reason=${encodeURIComponent(reason)}`);
            if (res.data.success) {
                toast.success(res.data.message);
                loadAffectedAppointments();
            } else {
                toast.error(res.data.message);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Error");
        }
        setLoading(false);
    };

    const loadAffectedAppointments = async () => {
        if (!selectedDoctor || !date) return;
        try {
            const res = await apiClient.get(`/api/reassignment/affected?doctorId=${selectedDoctor}&date=${date}`);
            if (res.data.success) {
                setAffectedAppointments(res.data.data);
            }
        } catch (e) {
            toast.error("Failed to load affected appointments");
        }
    };

    const loadReplacements = async (appointment: any) => {
        setSelectedAppointment(appointment);
        try {
            const res = await apiClient.get(`/api/reassignment/replacements?originalAppointmentId=${appointment.appointmentId}`);
            if (res.data.success) {
                setReplacements(res.data.data);
                if (res.data.data.length === 0) {
                    toast.error("No suitable replacement doctors available.");
                }
            }
        } catch (e) {
            toast.error("Failed to load replacements");
        }
    };

    const reassign = async (newDoctorId: number, slotStart: string) => {
        if (!selectedAppointment) return;
        try {
            const res = await apiClient.post(`/api/reassignment/assign?appointmentId=${selectedAppointment.appointmentId}&newDoctorId=${newDoctorId}&newSlotStart=${slotStart}`);
            if (res.data.success) {
                toast.success("Appointment successfully reassigned");
                setSelectedAppointment(null);
                setReplacements([]);
                loadAffectedAppointments();
            } else {
                toast.error(res.data.message);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to reassign");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Doctor Reassignments</h1>
                <p className="text-slate-500 mt-1">Manage unexpected doctor unavailability and reassign patients.</p>
            </div>

            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Declare Unavailability
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
                        <select className="w-full border-slate-300 rounded-md p-2 border" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => (
                                <option key={d.doctorId} value={d.doctorId}>{d.name} ({d.department})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input type="date" className="w-full border-slate-300 rounded-md p-2 border" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <input type="text" placeholder="e.g. Emergency Surgery" className="w-full border-slate-300 rounded-md p-2 border" value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                    <div>
                        <button onClick={markUnavailable} disabled={loading} className="w-full bg-orange-600 text-white rounded-md p-2 font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><RefreshCcw className="h-4 w-4" /> Mark Unavailable</>}
                        </button>
                    </div>
                </div>
            </div>

            {affectedAppointments.length > 0 && (
                <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                    <h2 className="font-bold text-slate-900 mb-4">Affected Appointments ({affectedAppointments.length})</h2>
                    <div className="space-y-4">
                        {affectedAppointments.map(apt => (
                            <div key={apt.appointmentId} className="border p-4 rounded-lg flex justify-between items-center bg-orange-50 border-orange-200">
                                <div>
                                    <p className="font-bold text-slate-900">{apt.patientName}</p>
                                    <p className="text-sm text-slate-600">Original Slot: {apt.slotStart.substring(0,5)} • {apt.department}</p>
                                    <p className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Reassignment Pending</p>
                                </div>
                                <button onClick={() => loadReplacements(apt)} className="bg-blue-700 text-white px-4 py-2 rounded font-medium hover:bg-blue-800">
                                    Find Replacement
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
                    <h2 className="font-bold text-slate-900 mb-4">Suitable Replacements for {selectedAppointment.patientName}</h2>
                    {replacements.length === 0 ? (
                        <p className="text-red-500 text-sm">No suitable doctors available for {selectedAppointment.department} on this date.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {replacements.map(rep => (
                                <div key={rep.doctorId} className="border p-4 rounded-lg bg-slate-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-900">{rep.doctorName}</p>
                                        <p className="text-sm text-green-600 font-medium">Available at: {rep.slotStart}</p>
                                    </div>
                                    <button onClick={() => reassign(rep.doctorId, rep.slotStart)} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> Assign
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

