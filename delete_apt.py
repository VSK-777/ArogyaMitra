
import psycopg2

conn = psycopg2.connect("postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
cur = conn.cursor()

# Get pre-consultation IDs for this appointment
cur.execute("SELECT id FROM pre_consultations WHERE appointment_id = 41;")
pc_ids = [row[0] for row in cur.fetchall()]

if pc_ids:
    # Delete pre_consultation_responses
    cur.execute("DELETE FROM pre_consultation_responses WHERE pre_consultation_id = ANY(%s);", (pc_ids,))
    # Delete pre_consultations
    cur.execute("DELETE FROM pre_consultations WHERE appointment_id = 41;")

# Delete queue_tokens
cur.execute("DELETE FROM queue_tokens WHERE appointment_id = 41;")

# Delete the appointment
cur.execute("DELETE FROM appointments WHERE id = 41;")

print("Successfully deleted the appointment and its dependencies.")
conn.commit()
conn.close()

