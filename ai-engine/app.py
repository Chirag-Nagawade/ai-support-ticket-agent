from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_logic import analyze_ticket
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data or 'user_ticket' not in data:
        return jsonify({'error': 'Missing user_ticket data'}), 400
        
    user_ticket = data.get('user_ticket')
    # previous_tickets could be passed to detect similar issues
    previous_tickets = data.get('previous_tickets', [])
    
    try:
        analysis_result = analyze_ticket(user_ticket, previous_tickets)
        return jsonify(analysis_result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)