import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CreatorProfile() {
  const [formData, setFormData] = useState({
    youtube_subscribers: '',
    video_views_last_30_days: '',
    country: '',
    category: '',
    platforms: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateCreatorProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.profileCompleted) {
      navigate('/creator/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, value]
        : prev.platforms.filter(platform => platform !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const result = await updateCreatorProfile({
        ...formData,
        youtube_subscribers: parseInt(formData.youtube_subscribers),
        video_views_last_30_days: parseInt(formData.video_views_last_30_days)
      });
      
      if (result.success) {
        navigate('/creator/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
    setLoading(false);
  };

  const platformOptions = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Facebook', 'Twitch', 'Other'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-md text-white">
        <h2 className="text-3xl font-semibold mb-6 text-center">Complete Your Profile</h2>
        {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">YouTube Subscribers</label>
            <input
              type="number"
              name="youtube_subscribers"
              value={formData.youtube_subscribers}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your subscriber count"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Video Views (Last 30 Days)</label>
            <input
              type="number"
              name="video_views_last_30_days"
              value={formData.video_views_last_30_days}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter views count"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="" disabled>Select Country</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="India">India</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="Gaming">Gaming</option>
              <option value="Tech">Technology</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Fitness">Fitness</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map(platform => (
                <label key={platform} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={platform}
                    checked={formData.platforms.includes(platform)}
                    onChange={handlePlatformChange}
                    className="mr-2 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white">{platform}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg transition disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
