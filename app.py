from flask import Flask, render_template, request, jsonify, session
import sqlite3
import random
import string
import json

app = Flask(__name__)
app.secret_key = 'super_secret_government_key'
DATABASE = 'students.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def entry_form():
    return render_template('entry.html')

@app.route('/view')
def view_data():
    return render_template('view.html')

@app.route('/api/captcha', methods=['GET'])
def generate_captcha():
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    session['captcha'] = captcha_text
    return jsonify({'captcha': captcha_text})

@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.json
    
    # 1. Validate CAPTCHA
    user_captcha = data.get('captcha', '')
    server_captcha = session.get('captcha', '')
    if not user_captcha or user_captcha.upper() != server_captcha:
        return jsonify({'success': False, 'message': 'Invalid CAPTCHA'}), 400

    # Extract Data
    name = data.get('name', '').strip()
    mobile = data.get('mobile', '').strip()
    
    # Basic Backend Validation
    if not name or not mobile or len(mobile) != 10:
        return jsonify({'success': False, 'message': 'Invalid Name or Mobile'}), 400

    # 2. Generate Acknowledgement Number
    padded_name = name.ljust(5, 'X')
    name_part = padded_name[2:5]
    mobile_part = mobile[4:6]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get current max ID to increment
    cursor.execute('SELECT MAX(id) FROM students')
    max_id_row = cursor.fetchone()[0]
    next_id = (max_id_row if max_id_row else 0) + 1
    counter_part = str(1000 + next_id)
    
    ack_number = f"{name_part}{mobile_part}{counter_part}"

    # 3. Insert into Database
    try:
        subjects_json = json.dumps(data.get('subjects', []))
        cursor.execute('''
            INSERT INTO students (
                name, mobile, email, address, district, taluk, village,
                subjects, total, average, acknowledgement_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            name, mobile, data.get('email'), data.get('address'),
            data.get('district'), data.get('taluk'), data.get('village'),
            subjects_json, data.get('total'),
            data.get('average'), ack_number
        ))
        conn.commit()
        # Clear captcha after success
        session.pop('captcha', None)
        return jsonify({'success': True, 'acknowledgement_number': ack_number})
    except sqlite3.IntegrityError:
         return jsonify({'success': False, 'message': 'Database error occurred.'}), 500
    finally:
         conn.close()

@app.route('/api/students/search', methods=['GET'])
def search_student():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM students 
        WHERE acknowledgement_number = ? OR mobile = ?
    ''', (query, query))
    
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(students)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
