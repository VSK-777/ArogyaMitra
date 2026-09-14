
c = open("src/modules/doctor/DoctorUpcomingAppointments.tsx").read()
old_code = """
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            apt.status === 'BOOKED' ? 'bg-green-50 text-green-700' :
                                            apt.status === 'REASSIGNMENT_PENDING' ? 'bg-orange-50 text-orange-700' :
                                            'bg-gray-50 text-gray-700'
                                        }`}>
                                            {apt.status}
                                        </span>
"""
new_code = """
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            apt.preConsultationCompleted ? 'bg-purple-50 text-purple-700' :
                                            apt.status === 'BOOKED' ? 'bg-green-50 text-green-700' :
                                            apt.status === 'REASSIGNMENT_PENDING' ? 'bg-orange-50 text-orange-700' :
                                            'bg-gray-50 text-gray-700'
                                        }`}>
                                            {apt.preConsultationCompleted ? 'Pre-Consultation Completed' : apt.status}
                                        </span>
"""
if old_code.strip() in c:
    c = c.replace(old_code.strip(), new_code.strip())
    open("src/modules/doctor/DoctorUpcomingAppointments.tsx", "w").write(c)
    print("Replaced successfully")
else:
    print("Could not find exact old_code block")

