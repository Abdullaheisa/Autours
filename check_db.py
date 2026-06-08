import sqlite3
import os

db_paths = [
    r"d:\Autours\backend\database\database.sqlite",
    r"D:\autours-main\backend\database\database.sqlite"
]

for db in db_paths:
    print("---------------------------------")
    print("DB Path:", db)
    if not os.path.exists(db):
        print("Does not exist")
        continue
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print("Tables:", tables)
        
        if "included" in tables:
            cursor.execute("PRAGMA table_info(included)")
            cols = [c[1] for c in cursor.fetchall()]
            print("Included cols:", cols)
            
            cursor.execute("SELECT is_promo, COUNT(*) FROM included GROUP BY is_promo")
            print("Included group by is_promo:", cursor.fetchall())
            
            cursor.execute("SELECT id, what_is_included, is_promo, supplier_id, status FROM included WHERE is_promo = 1")
            print("Promos (is_promo = 1):", cursor.fetchall())
            
            cursor.execute("SELECT id, what_is_included, is_promo, supplier_id, status FROM included WHERE is_promo = 0 LIMIT 5")
            print("Standard (is_promo = 0):", cursor.fetchall())
            
        if "promos" in tables:
            cursor.execute("SELECT COUNT(*) FROM promos")
            print("Promos count in promos table:", cursor.fetchone()[0])
            cursor.execute("SELECT * FROM promos LIMIT 5")
            print("Promos in promos table:", cursor.fetchall())
            
        conn.close()
    except Exception as e:
        print("Error:", e)
