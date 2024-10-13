from flask import Flask, jsonify, request, session
from flask_cors import CORS
from questions import MATH_QUESTIONS
from engine import perplexity_query, render_manim_visualization, render_visualization, claude_query
from dotenv import load_dotenv
import os
import json
import requests
import logging
load_dotenv()
app = Flask(__name__)
app.secret_key = "rdagrdsgfdf"
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
    
    context = f"Question: {current_question['question']}\nTopic: {current_question['topic']}\nDifficulty: {current_question['difficulty']}"
    
    # First query: Get the explanation (using Perplexity)
    explanation, _ = perplexity_query([
        {"role": "system", "content": "You are an AI tutor helping with SAT/ACT math questions. Provide clear, concise explanations for solving math problems. Focus on step-by-step solutions and key concepts."},
        {"role": "user", "content": f"Context: {context}\nStudent question: {user_question}\nPlease provide a detailed explanation on how to solve this problem."}
    ])

    if explanation is None:
        return jsonify({'error': 'Failed to generate explanation from Perplexity API'}), 500

    logging.debug(f"Perplexity explanation: {explanation}")

    # Second query: Get the Manim code (using Claude)
    engine_code = """
def render_manim_visualization(code):
    class CustomScene(Scene):
        def construct(self):
            exec(code)
    
    current_dir = os.getcwd()
    media_dir = os.path.join(current_dir, "media")
    videos_dir = os.path.join(media_dir, "videos", "1080p60")
    
    os.makedirs(media_dir, exist_ok=True)
    os.makedirs(videos_dir, exist_ok=True)
    
    config.media_dir = media_dir
    config.video_dir = videos_dir
    config.output_file = "CustomScene"

    try:
        scene = CustomScene()
        scene.render()

        output_path = os.path.join(videos_dir, "CustomScene.mp4")
        if os.path.exists(output_path):
            return output_path
        else:
            logging.error(f"Output file not found at: {output_path}")
            return None
    except Exception as e:
        logging.error(f"Error rendering visualization: {e}")
        return None
    """

    claude_prompt = f"""You are an AI specializing in creating Manim visualizations for math problems. Generate Manim code for a single video animation that will be passed as a parameter to the render_manim_visualization function. Here's the function:

{engine_code}

Context: {context}
Student question: {user_question}
Generate Manim code for a single video animation that will be passed as a parameter to the render_manim_visualization function. Provide only the code and comment out any other lines."""

    manim_code = claude_query(claude_prompt)

    if manim_code is None:
        return jsonify({'error': 'Failed to generate Manim code from Claude API'}), 500

    logging.debug(f"Manim code: {manim_code}")

    video_path = None
    if manim_code:
        video_path = render_manim_visualization(manim_code)
        if video_path is None:
            logging.warning("Failed to render Manim visualization")

    session['conversation'].append({
        'role': 'user',
        'content': user_question
    })
    session['conversation'].append({
        'role': 'ai',
        'content': explanation
    })
    
    return jsonify({
        'response': explanation,
        'manim_code': manim_code,
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