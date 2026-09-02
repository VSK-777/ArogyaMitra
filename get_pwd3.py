import psycopg2
db_url = "postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, name, mobile, role, password_hash FROM users WHERE mobile = '9490500730'")
    rows = cur.fetchall()
    if rows:
        col_names = [desc[0] for desc in cur.description]
        print("Found in users:", [dict(zip(col_names, row)) for row in rows])
    else:
        print("Not found in users")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
