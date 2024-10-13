from flask import Flask, jsonify, request, session
from flask_cors import CORS
from questions import MATH_QUESTIONS
from engine import perplexity_query, render_manim_visualization, render_visualization
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

#new routes
@app.route('/api/start_session', methods=['GET'])
def start_session():
    session['current_question_index'] = 0
    session['conversation'] = []
    return jsonify({'message': 'Session started'}), 200

@app.route('/api/get_question', methods=['GET'])
def get_question():
    if 'current_question_index' not in session:
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

@app.route('/api/', methods=['POST'])
def submit():
    data = request.json
    if 'current_question_index' not in session:
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
    
    if 'current_question_index' not in session:
        return jsonify({'message': 'Session not started'}), 400
    
    current_question = MATH_QUESTIONS[session['current_question_index']]
    
    # Prepare context for the AI
    context = f"Question: {current_question['question']}\nTopic: {current_question['topic']}\nDifficulty: {current_question['difficulty']}"
    
    # Use Perplexity API to generate a response and Manim code
    ai_response, manim_code = perplexity_query([
        {"role": "system", "content": "You are an AI tutor helping with SAT/ACT math questions. Provide clear, concise explanations and generate Manim code for visualizations when appropriate."},
        {"role": "user", "content": f"Context: {context}\nStudent question: {user_question}\nPlease provide an explanation and, if helpful, generate Manim code for a visualization."}
    ])
    
    # Generate visualization if Manim code is provided
    video_path = None
    if manim_code:
        video_path = render_manim_visualization(manim_code)
    
    # Store the conversation
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

@app.route('/api/get_conversation', methods=['GET'])
def get_conversation():
    if 'conversation' not in session:
        return jsonify({'conversation': []}), 200
    return jsonify({'conversation': session['conversation']}), 200

@app.route('/api/generate_visualization', methods=['POST'])
def generate_visualization():
    return render_visualization()
    


if __name__ == '__main__':
    app.run(debug=True)