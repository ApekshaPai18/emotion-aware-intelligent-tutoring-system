import sqlite3
import os

db_path = r'C:\Users\Apeksha\Desktop\emotion-aware-its1\data\database\its.db'
print(f'Checking database: {db_path}')
print(f'Database exists: {os.path.exists(db_path)}')
print('-' * 50)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cursor.fetchall()
    
    print('📊 TABLES IN DATABASE:')
    if not tables:
        print('   No tables found!')
    
    for table in tables:
        table_name = table[0]
        print(f'\n📁 Table: {table_name}')
        
        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        print('   Columns:')
        for col in columns:
            print(f'     - {col[1]} ({col[2]})')
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f'   Rows: {count}')
        
        # Show sample data if any
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
            samples = cursor.fetchall()
            print('   Sample data:')
            for sample in samples:
                print(f'     {sample}')
    
    conn.close()
else:
    print('❌ Database file not found!')