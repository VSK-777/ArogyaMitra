
import psycopg2

conn = psycopg2.connect("postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
cur = conn.cursor()
cur.execute("SELECT appointment_id, COUNT(*) FROM pre_consultations GROUP BY appointment_id HAVING COUNT(*) > 1;")
print("Duplicates:", cur.fetchall())
conn.close()

