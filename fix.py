
import psycopg2

conn = psycopg2.connect("postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
cur = conn.cursor()
cur.execute("DELETE FROM appointments WHERE appointment_id = 'APT-20260914-TEST99';")
conn.commit()
conn.close()

