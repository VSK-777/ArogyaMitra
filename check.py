import psycopg2
db_url = "postgresql://neondb_owner:npg_eCqWE5JtlM4x@ep-autumn-forest-azx7vr4w-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT mobile FROM users WHERE mobile IN ('9999999999', '9490500730')")
print(cur.fetchall())
