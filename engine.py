from flask import Flask, jsonify, request
from manim import *
import os
import requests
import json
import shutil
import logging
import re
import anthropic

logging.basicConfig(level=logging.DEBUG)

def extract_code_from_markdown(content):
    code_pattern = r'```python\n(.*?)```'
    match = re.search(code_pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return content  # Return original content if no code block is found

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
    os.makedirs(videos_dir, exist_ok=True)
    
    if os.path.exists(videos_dir):
        for item in os.listdir(videos_dir):
            item_path = os.path.join(videos_dir, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)

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
        logging.error(f"Manim code that caused the error:\n{code}")
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
        "model": "llama-3.1-sonar-huge-128k-online",
        "messages": messages,
        "max_tokens": 1000,
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
    
    try:
        response = requests.request("POST", url, json=payload, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        content = response_data['choices'][0]['message']['content']
        
        # Extract code from markdown if present
        code = extract_code_from_markdown(content)
        
        return content, code  # Return the full content and extracted code
    except requests.RequestException as e:
        logging.error(f"Error querying Perplexity API: {str(e)}")
        return None, None

# If you need any additional utility functions, add them here
def claude_query(prompt):
    client = anthropic.Anthropic(api_key="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")
    
    try:
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            temperature=0.2,
            system="You are an AI specializing in creating Manim visualizations for math problems.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text
    except Exception as e:
        logging.error(f"Error querying Claude API: {str(e)}")
        return None