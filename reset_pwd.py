import psycopg2
import bcrypt

db_url = "postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    salt = bcrypt.gensalt(10)
    hashed = bcrypt.hashpw(b"patient123", salt).decode('utf-8')
    cur.execute("UPDATE users SET password_hash = %s WHERE mobile IN ('9999999999', '9490500730')", (hashed,))
    conn.commit()
    print(f"Rows updated: {cur.rowcount}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
