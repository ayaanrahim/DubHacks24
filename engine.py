from flask import Flask, jsonify, request
from manim import *
import os
import requests
import json

def render_manim_visualization(code):
    class CustomScene(Scene):
        def construct(self):
            exec(code)

    scene = CustomScene()
    output_file_name = "output_video"
    config.media_dir = "/media"

    try:
        scene.render()
        output_path = os.path.join(config.media_dir, "videos", "CustomScene", "1080p60", f"{output_file_name}.mp4")
        if os.path.exists(output_path):
            return f"/media/videos/CustomScene/1080p60/{output_file_name}.mp4"
        else:
            return None
    except Exception as e:
        print(f"Error rendering visualization: {e}")
        return None

def render_visualization():
    data = request.json
    code = data.get('code', '')

    video_path = render_manim_visualization(code)

    if video_path:
        jsonify({'video_path': video_path}), 200
    else:
        return jsonify({'error': 'Failed to render visualization.'}), 500
    
def perplexity_query(messages):
    url = "https://api.perplexity.ai/chat/completions"
    payload = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": messages,
        "max_tokens": 500,  # Increased to allow for Manim code
        "temperature": 0.2,
        "top_p": 0.9,
        "return_citations": True,
        "search_domain_filter": ["perplexity.ai"],
        "return_images": False,
        "return_related_questions": False,
        "search_recency_filter": "month",
        "top_k": 0,
        "stream": False,
        "presence_penalty": 0,
        "frequency_penalty": 1
    }
    
    headers = {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
    }
    
    response = requests.request("POST", url, json=payload, headers=headers)
    response_data = json.loads(response.text)
    content = response_data['choices'][0]['message']['content']
    
    # Extract Manim code if present
    manim_code = None
    if "```python" in content and "```" in content.split("```python")[1]:
        manim_code = content.split("```python")[1].split("```").strip()
    
    return content, manim_code