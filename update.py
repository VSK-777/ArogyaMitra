
import psycopg2
from datetime import datetime

conn = psycopg2.connect("postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
cur = conn.cursor()

# 1. Cancel previous appointments on 2026-09-13
cur.execute("UPDATE appointments SET status = 'CANCELLED' WHERE appointment_date = '2026-09-13' AND patient_id = 24;")
print("Cancelled 13th appointments:", cur.rowcount)

# Cancel the previously existing appointment on the 15th that was in the screenshot, if it exists, to avoid clutter
cur.execute("UPDATE appointments SET status = 'CANCELLED' WHERE appointment_date = '2026-09-15' AND patient_id = 24;")

# 2. Add new appointment for VAJJHA SAI KRISHNA (ID: 24) with Dr. Kavita Singh (ID: 6)
# Department ID: 6, Hospital ID: 2
# Time: 21:00 (9:00 PM) on 2026-09-14
cur.execute("""
    INSERT INTO appointments (
        appointment_date, appointment_id, appointment_type, created_at, updated_at, 
        slot_start, slot_end, status, department_id, doctor_id, hospital_id, patient_id, check_in_status
    ) VALUES (
        '2026-09-14', 'APT-20260914-TEST99', 'ONLINE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        '21:00:00', '21:30:00', 'BOOKED', 6, 6, 2, 24, 'NOT_CHECKED_IN'
    )
""")

conn.commit()
print("Inserted new test appointment!")

conn.close()

