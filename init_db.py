import sqlite3
import os

DATABASE = 'students.db'

def init_db():
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
        
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL,
            district TEXT NOT NULL,
            taluk TEXT NOT NULL,
            village TEXT NOT NULL,
            subjects TEXT NOT NULL,
            total INTEGER NOT NULL,
            average REAL NOT NULL,
            acknowledgement_number TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
