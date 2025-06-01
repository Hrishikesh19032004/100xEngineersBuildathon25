from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import uuid
from datetime import datetime
import threading
from video_generator import VideoGenerator

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'generated_videos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize video generator
video_gen = VideoGenerator()

@app.route('/api/generate-video', methods=['POST'])
def generate_video():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['brandName', 'industry', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate unique ID for this video
        video_id = str(uuid.uuid4())
        
        # Start video generation in background
        thread = threading.Thread(
            target=video_gen.generate_video_async,
            args=(data, video_id)
        )
        thread.start()
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'message': 'Video generation started'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video-status/<video_id>', methods=['GET'])
def get_video_status(video_id):
    try:
        status = video_gen.get_generation_status(video_id)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-video/<video_id>', methods=['GET'])
def download_video(video_id):
    try:
        video_path = os.path.join(UPLOAD_FOLDER, f"{video_id}.mp4")
        if os.path.exists(video_path):
            return send_file(video_path, as_attachment=True)
        else:
            return jsonify({'error': 'Video not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)