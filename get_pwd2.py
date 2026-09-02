import psycopg2

db_url = "postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = cur.fetchall()
    print("Tables:", [t[0] for t in tables])
    
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
    cols = cur.fetchall()
    print("Users columns:", [c[0] for c in cols])
    
    cur.execute("SELECT * FROM users WHERE username = '9490500730'")
    rows = cur.fetchall()
    if rows:
        col_names = [desc[0] for desc in cur.description]
        print("Found in users:", [dict(zip(col_names, row)) for row in rows])
        
    if 'patients' in [t[0] for t in tables]:
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'patients'")
        p_cols = cur.fetchall()
        print("Patients columns:", [c[0] for c in p_cols])
        
        # We don't know the column name, maybe phone?
        phone_col = next((c[0] for c in p_cols if 'phone' in c[0]), None)
        if phone_col:
            cur.execute(f"SELECT * FROM patients WHERE {phone_col} = '9490500730'")
            p_rows = cur.fetchall()
            if p_rows:
                col_names = [desc[0] for desc in cur.description]
                print("Found in patients:", [dict(zip(col_names, row)) for row in p_rows])
                
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
