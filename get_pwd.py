import psycopg2
from urllib.parse import urlparse

# connection string
db_url = "postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    # Search for user with phone or username 9490500730
    cur.execute("SELECT * FROM users WHERE phone_number = '9490500730' OR username = '9490500730'")
    rows = cur.fetchall()
    
    if not rows:
        print("No user found with 9490500730")
    else:
        # get column names
        col_names = [desc[0] for desc in cur.description]
        for row in rows:
            print(dict(zip(col_names, row)))
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
