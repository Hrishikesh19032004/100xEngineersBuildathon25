// File: src/pages/business/BusinessDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareText } from 'lucide-react';

export default function BusinessDashboard() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/creators', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCreators(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load creators');
        setLoading(false);
      }
    };

    fetchCreators();
  }, [user.token]);

  const startChat = async (creatorId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/chat/start', {
        creator_id: creatorId
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate(`/chat/${response.data.session_id}`);
    } catch (err) {
      alert('Failed to start chat session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading creators...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg mb-4">
            <MessageSquareText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Creators Directory</h1>
          <p className="text-gray-400">Start a chat with the best creators for your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{creator.name}</h2>
                  <p className="text-purple-400">@{creator.channel_name}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {creator.category}
                  </span>
                  <span className="bg-pink-900/30 text-pink-300 px-3 py-1 rounded-full text-sm">
                    {creator.country}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-700/40 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Subscribers</p>
                    <p className="font-bold text-white text-lg">{creator.youtube_subscribers.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/40 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">30-Day Views</p>
                    <p className="font-bold text-white text-lg">{creator.video_views_last_30_days.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {creator.platforms.map((platform, index) => (
                      <span key={index} className="bg-gray-700/40 text-white px-2 py-1 rounded text-xs">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => startChat(creator.id)}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center"
              >
                <MessageSquareText className="w-5 h-5 mr-2" />
                Start Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
