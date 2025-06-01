import os
import json
import subprocess
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from moviepy.editor import *
import requests
import torch

class VideoGenerator:
    def __init__(self):
        self.generation_status = {}
        
        # Initialize AI models
        self.setup_models()
        
    def setup_models(self):
        """Initialize AI models"""
        try:
            # Setup Stable Diffusion for image generation (optional)
            # Uncomment if you want to use Stable Diffusion
            # from diffusers import StableDiffusionPipeline
            # self.sd_pipe = StableDiffusionPipeline.from_pretrained(
            #     "runwayml/stable-diffusion-v1-5",
            #     torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            # )
            # if torch.cuda.is_available():
            #     self.sd_pipe = self.sd_pipe.to("cuda")
            
            print("Models initialized successfully")
        except Exception as e:
            print(f"Error initializing models: {e}")
    
    def generate_script(self, brand_data):
        """Generate video script using templates"""
        try:
            templates = {
                'technology': [
                    f"Introducing {brand_data['brandName']} - Where innovation meets excellence.",
                    f"Transform your digital experience with {brand_data['brandName']}.",
                    f"The future is here with {brand_data['brandName']}."
                ],
                'healthcare': [
                    f"Your health, our priority. Welcome to {brand_data['brandName']}.",
                    f"Caring for you with cutting-edge healthcare solutions.",
                    f"Trust {brand_data['brandName']} for your wellness journey."
                ],
                'finance': [
                    f"Secure your financial future with {brand_data['brandName']}.",
                    f"Smart money management starts here.",
                    f"Your trusted financial partner."
                ],
                'retail': [
                    f"Discover amazing products at {brand_data['brandName']}.",
                    f"Quality meets affordability.",
                    f"Shop with confidence today."
                ],
                'default': [
                    f"Experience excellence with {brand_data['brandName']}.",
                    f"Quality you can trust. Service you deserve.",
                    f"Choose {brand_data['brandName']} for the best."
                ]
            }
            
            industry = brand_data.get('industry', 'default')
            script_lines = templates.get(industry, templates['default'])
            
            # Add description-based content
            if brand_data.get('description'):
                description_line = brand_data['description'][:100]
                if len(brand_data['description']) > 100:
                    description_line += "..."
                script_lines.append(description_line)
            
            # Adjust script length based on duration
            duration = int(brand_data.get('duration', 30))
            if duration == 15:
                script_lines = script_lines[:2]
            elif duration == 60:
                script_lines.extend([
                    f"Join thousands of satisfied customers.",
                    f"Contact us today to get started."
                ])
            
            return script_lines
            
        except Exception as e:
            print(f"Error generating script: {e}")
            return [f"Welcome to {brand_data['brandName']}", "Quality and excellence combined."]
    
    def generate_images(self, brand_data, script):
        """Generate images using simple graphics"""
        images = []
        
        try:
            # Color schemes based on industry
            color_schemes = {
                'technology': [(0, 123, 255), (40, 167, 69), (108, 117, 125)],
                'healthcare': [(220, 53, 69), (23, 162, 184), (108, 117, 125)],
                'finance': [(40, 167, 69), (0, 123, 255), (108, 117, 125)],
                'retail': [(255, 193, 7), (220, 53, 69), (0, 123, 255)],
                'default': [(73, 109, 137), (108, 117, 125), (52, 58, 64)]
            }
            
            industry = brand_data.get('industry', 'default')
            colors = color_schemes.get(industry, color_schemes['default'])
            
            for i in range(len(script)):
                color = colors[i % len(colors)]
                image_path = f"temp_image_{i}.png"
                self.create_brand_image(image_path, brand_data, color, i)
                images.append(image_path)
            
        except Exception as e:
            print(f"Error in image generation: {e}")
            # Create fallback images
            for i in range(len(script)):
                self.create_fallback_image(f"temp_image_{i}.png", brand_data)
                images.append(f"temp_image_{i}.png")
        
        return images
    
    def create_brand_image(self, filename, brand_data, color, index):
        """Create a branded image with gradient and text"""
        img = Image.new('RGB', (1280, 720), color=color)
        draw = ImageDraw.Draw(img)
        
        # Create gradient effect
        for i in range(720):
            factor = i / 720
            new_color = tuple(int(c * (1 - factor * 0.3)) for c in color)
            draw.line([(0, i), (1280, i)], fill=new_color)
        
        # Add brand name
        try:
            font_large = ImageFont.truetype("arial.ttf", 80)
            font_small = ImageFont.truetype("arial.ttf", 40)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        brand_name = brand_data['brandName']
        
        # Center the brand name
        bbox = draw.textbbox((0, 0), brand_name, font=font_large)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (1280 - text_width) // 2
        y = (720 - text_height) // 2 - 50
        
        # Add shadow effect
        draw.text((x + 3, y + 3), brand_name, fill=(0, 0, 0, 128), font=font_large)
        draw.text((x, y), brand_name, fill='white', font=font_large)
        
        # Add industry below
        industry_text = brand_data.get('industry', '').title()
        if industry_text:
            bbox_small = draw.textbbox((0, 0), industry_text, font=font_small)
            text_width_small = bbox_small[2] - bbox_small[0]
            x_small = (1280 - text_width_small) // 2
            y_small = y + text_height + 20
            
            draw.text((x_small + 2, y_small + 2), industry_text, fill=(0, 0, 0, 128), font=font_small)
            draw.text((x_small, y_small), industry_text, fill='white', font=font_small)
        
        img.save(filename)
    
    def create_fallback_image(self, filename, brand_data):
        """Create a simple fallback image with brand name"""
        img = Image.new('RGB', (1280, 720), color=(73, 109, 137))
        draw = ImageDraw.Draw(img)
        
        try:
            font = ImageFont.truetype("arial.ttf", 60)
        except:
            font = ImageFont.load_default()
        
        text = brand_data['brandName']
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (1280 - text_width) // 2
        y = (720 - text_height) // 2
        
        draw.text((x, y), text, fill='white', font=font)
        img.save(filename)
    
    def create_video(self, brand_data, script, images, video_id):
        """Create video using MoviePy"""
        try:
            clips = []
            total_duration = int(brand_data.get('duration', 30))
            duration_per_clip = total_duration / len(script)
            
            for i, (line, image_path) in enumerate(zip(script, images)):
                # Create image clip
                img_clip = ImageClip(image_path, duration=duration_per_clip)
                
                # Add text overlay with better styling
                txt_clip = TextClip(
                    line,
                    fontsize=40,
                    color='white',
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=2,
                    method='caption',
                    size=(1200, None),
                    align='center'
                ).set_position('center').set_duration(duration_per_clip)
                
                # Add fade in/out effects
                img_clip = img_clip.fadein(0.5).fadeout(0.5)
                txt_clip = txt_clip.fadein(0.5).fadeout(0.5)
                
                # Compose clip
                composed_clip = CompositeVideoClip([img_clip, txt_clip])
                clips.append(composed_clip)
            
            # Concatenate all clips
            final_video = concatenate_videoclips(clips, method="compose")
            
            # Export video
            output_path = f"generated_videos/{video_id}.mp4"
            final_video.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Cleanup temporary files
            for img_path in images:
                if os.path.exists(img_path):
                    os.remove(img_path)
            
            return output_path
            
        except Exception as e:
            print(f"Error creating video: {e}")
            return None
    
    def generate_video_async(self, brand_data, video_id):
        """Generate video asynchronously"""
        try:
            self.generation_status[video_id] = {
                'status': 'processing',
                'progress': 0,
                'message': 'Starting generation...'
            }
            
            # Step 1: Generate script
            self.generation_status[video_id].update({
                'progress': 20,
                'message': 'Generating script...'
            })
            script = self.generate_script(brand_data)
            
            # Step 2: Generate images
            self.generation_status[video_id].update({
                'progress': 40,
                'message': 'Creating visuals...'
            })
            images = self.generate_images(brand_data, script)
            
            # Step 3: Create video
            self.generation_status[video_id].update({
                'progress': 70,
                'message': 'Composing video...'
            })
            video_path = self.create_video(brand_data, script, images, video_id)
            
            if video_path and os.path.exists(video_path):
                self.generation_status[video_id].update({
                    'status': 'completed',
                    'progress': 100,
                    'message': 'Video generated successfully!',
                    'video_url': f'/api/download-video/{video_id}'
                })
            else:
                self.generation_status[video_id].update({
                    'status': 'failed',
                    'progress': 100,
                    'message': 'Failed to generate video'
                })
        
        except Exception as e:
            print(f"Error in video generation: {e}")
            self.generation_status[video_id].update({
                'status': 'failed',
                'progress': 100,
                'message': f'Error: {str(e)}'
            })
    
    def get_generation_status(self, video_id):
        """Get generation status for a video"""
        return self.generation_status.get(video_id, {
            'status': 'not_found',
            'message': 'Video ID not found'
        })