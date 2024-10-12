from flask import Flask, jsonify, request
from flask_cors import CORS
from questions import MATH_QUESTIONS
from engine import perplexity_query
from dotenv import load_dotenv
import os
import json
import requests
load_dotenv()
app = Flask(__name__)
CORS(app)

api_key = os.getenv("perplexity_api_key")
api_base = "https://api.perplexity.ai"

@app.route('/api/questions', methods=['GET'])
def get_questions():
    return jsonify(MATH_QUESTIONS), 200

@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    data = request.json
    question = next((q for q in MATH_QUESTIONS if q['id'] == data['question_id']), None)
    if not question:
        return jsonify({'message': 'Question not found'}), 404
    is_correct = abs(float(data['answer']) - question['answer']) < 0.001
    return jsonify({
        'correct': is_correct,
        'message': 'Correct!' if is_correct else 'Incorrect. Try again.'
    }), 200

@app.route('/api/sample_query', methods=['GET'])
def hello():
    return perplexity_query([
        {
            "role": "system",
            "content": "Be precise and concise."
        },
        {
            "role": "user",
            "content": "How many stars are there in our galaxy?"
        }
    ])


if __name__ == '__main__':
    app.run(debug=True)