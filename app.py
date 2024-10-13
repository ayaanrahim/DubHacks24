from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session
from questions import MATH_QUESTIONS
from engine import perplexity_query, render_manim_visualization, render_visualization
from dotenv import load_dotenv
import os
import json
import requests

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

@app.route('/api/start_session', methods=['GET'])
def start_session():
    session.clear()  # Clear any existing session data
    session['current_question_index'] = 0
    session['conversation'] = []
    session['session_started'] = True  # Add a flag to indicate the session has started
    return jsonify({'message': 'Session started', 'session_id': session.sid}), 200

@app.route('/api/get_question', methods=['GET'])
def get_question():
    if 'session_started' not in session or not session['session_started']:
        return jsonify({'message': 'Session not started'}), 400
    
    if session['current_question_index'] >= len(MATH_QUESTIONS):
        return jsonify({'message': 'All questions completed'}), 200
    
    question = MATH_QUESTIONS[session['current_question_index']]
    return jsonify({
        'id': question['id'],
        'question': question['question'],
        'difficulty': question['difficulty'],
        'topic': question['topic']
    }), 200

@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    data = request.json
    if 'session_started' not in session or not session['session_started']:
        return jsonify({'message': 'Session not started'}), 400
    
    current_question = MATH_QUESTIONS[session['current_question_index']]
    is_correct = abs(float(data['answer']) - current_question['answer']) < 0.001
    if is_correct:
        session['current_question_index'] += 1
        return jsonify({
            'correct': True,
            'message': 'Correct! Moving to the next question.'
        }), 200
    else:
        return jsonify({
            'correct': False,
            'message': 'Incorrect. Would you like an explanation?'
        }), 200

@app.route('/api/ask_question', methods=['POST'])
def ask_question():
    data = request.json
    user_question = data['question']
    
    if 'session_started' not in session or not session['session_started']:
        return jsonify({'message': 'Session not started'}), 400
    
    current_question = MATH_QUESTIONS[session['current_question_index']]
    
    context = f"Question: {current_question['question']}\nTopic: {current_question['topic']}\nDifficulty: {current_question['difficulty']}"
    
    ai_response, manim_code = perplexity_query([
        {"role": "system", "content": "You are an AI tutor helping with SAT/ACT math questions. Provide clear, concise explanations and generate Manim code for visualizations when appropriate."},
        {"role": "user", "content": f"Context: {context}\nStudent question: {user_question}\nPlease provide an explanation and, if helpful, generate Manim code for a visualization."}
    ])
    
    video_path = None
    if manim_code:
        video_path = render_manim_visualization(manim_code)
    
    session['conversation'].append({
        'role': 'user',
        'content': user_question
    })
    session['conversation'].append({
        'role': 'ai',
        'content': ai_response
    })
    
    return jsonify({
        'response': ai_response,
        'video_path': video_path
    }), 200

if __name__ == '__main__':
    app.run(debug=True)