
import psycopg2

conn = psycopg2.connect("postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
cur = conn.cursor()
cur.execute("SELECT id, appointment_id FROM appointments WHERE patient_id = 24 AND appointment_date = '2026-09-14' AND status = 'BOOKED';")
print("Appointments to delete:", cur.fetchall())
conn.close()

