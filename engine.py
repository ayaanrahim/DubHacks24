from flask import Flask, jsonify, request
from manim import *
import os
import requests
import json
import shutil

def render_manim_visualization(code):
    class CustomScene(Scene):
        def construct(self):
            exec(code)

    # Use the current working directory to ensure we have write permissions
    current_dir = os.getcwd()
    media_dir = os.path.join(current_dir, "media")
    videos_dir = os.path.join(media_dir, "videos", "1080p60")
    
    # Ensure the media directory exists
    os.makedirs(media_dir, exist_ok=True)
    
    if os.path.exists(videos_dir):
        for item in os.listdir(videos_dir):
            item_path = os.path.join(videos_dir, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)

    config.media_dir = media_dir

    try:
        scene = CustomScene()
        scene.render()

        output_path = os.path.join(media_dir, "videos", "1080p60", "CustomScene.mp4")
        if os.path.exists(output_path):
            return output_path
        else:
            print(f"Output file not found at: {output_path}")
            return None
    except Exception as e:
        print(f"Error rendering visualization: {e}")
        return None

def render_visualization():
    data = request.json
    code = data.get('code', '')

    video_path = render_manim_visualization(code)

    if video_path:
        return jsonify({'video_path': video_path}), 200
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
        manim_code = content.split("```python")[1].split("```")[0].strip()
    
    return content #, manim_code