import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareText } from 'lucide-react';

export default function CreatorChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Fetch businesses you've previously chatted with
        const response = await axios.get('http://localhost:5000/api/businesses', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        // Format the chat data with ZegoCloud session IDs
        const formattedChats = response.data.map(business => ({
          business_id: business.id,
          name: business.business_name,
          session_id: `business_${business.id}_creator_${user.id}`
        }));
        
        setChats(formattedChats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load businesses');
        setLoading(false);
      }
    };

    fetchChats();
  }, [user.token, user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading businesses...</p>
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
        <div className="mb-10 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg mb-4">
            <MessageSquareText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Businesses</h1>
          <p className="text-gray-400">Chat with businesses you've connected with</p>
        </div>

        {chats.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-xl mx-auto">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2 text-white">No Businesses Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't connected with any businesses yet.
            </p>
            <Link
              to="/creator/dashboard"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300"
            >
              View Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map(chat => (
              <Link
                key={chat.session_id}
                to={`/chat/${chat.session_id}`}
                className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform block"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/20 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-300">
                        {chat.name?.charAt(0)?.toUpperCase() || 'B'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="ml-4 overflow-hidden">
                    <h2 className="text-lg font-semibold text-white truncate">{chat.name}</h2>
                    <p className="text-blue-400 text-sm">Business</p>
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      Click to start chatting
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}