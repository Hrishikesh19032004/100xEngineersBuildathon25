import React, { useState } from 'react';
import { Upload, Play, Download, Loader2, Sparkles } from 'lucide-react';

const VideoGenerator = () => {
  const [formData, setFormData] = useState({
    brandName: '',
    industry: '',
    description: '',
    targetAudience: '',
    tone: 'professional',
    duration: '30',
    style: 'modern'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setVideoUrl(result.videoUrl);
        setProgress(100);
      } else {
        alert('Failed to generate video. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" />
            AI Video Generator
          </h1>
          <p className="text-xl text-blue-200">Create stunning promotional videos with AI</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Brand Name *</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your brand name"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Industry *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="food">Food & Beverage</option>
                    <option value="fashion">Fashion</option>
                    <option value="automotive">Automotive</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Brand Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Describe your brand, products, or services..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Young professionals, Tech enthusiasts, Parents"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Tone</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="energetic">Energetic</option>
                    <option value="elegant">Elegant</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="15">15 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Style</label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="modern">Modern</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="animated">Animated</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating Video... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Play />
                    Generate Video
                  </>
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-8">
                <div className="bg-white/20 rounded-lg p-6">
                  <div className="flex justify-between text-white mb-2">
                    <span>Generating your video...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 text-blue-200 text-sm">
                    <div>✓ Analyzing brand information</div>
                    <div className={progress > 30 ? 'text-green-400' : ''}>
                      {progress > 30 ? '✓' : '○'} Generating script and scenes
                    </div>
                    <div className={progress > 60 ? 'text-green-400' : ''}>
                      {progress > 60 ? '✓' : '○'} Creating visuals and animations
                    </div>
                    <div className={progress > 90 ? 'text-green-400' : ''}>
                      {progress > 90 ? '✓' : '○'} Finalizing video
                    </div>
                  </div>
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="mt-8">
                <div className="bg-white/20 rounded-lg p-6">
                  <h3 className="text-white text-xl font-bold mb-4">Your Video is Ready!</h3>
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
                    <video 
                      controls 
                      className="w-full"
                      src={videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Download size={18} />
                      Download Video
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                      Generate Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;