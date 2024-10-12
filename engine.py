from flask import Flask, jsonify, request
from manim import *
import os

def render_manim_visualization(code):
    class CustomScene(Scene):
        def construct(self):
            exec(code)

    scene = CustomScene()

    output_file_name = "output_video"
    config.media_dir = "./media"

    try:
        scene.render()

        output_path = os.path.join(config.media_dir, "videos", "CustomScene", "1080p60", f"{output_file_name}.mp4")

        if os.path.exists(output_path):
            return output_path
        else:
            return None
        
    except Exception as e:
        print(f"Error rendering visualization")
        return None

def render_visualization():
    data = request.json
    code = data.get('code', '')

    video_path = render_manim_visualization(code)

    if video_path:
        jsonify({'video_path': video_path}), 200
    else:
        return jsonify({'error': 'Failed to render visualization.'}), 500