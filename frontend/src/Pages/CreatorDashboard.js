// src/pages/CreatorDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import CreatorService from '../services/creatorService';

function CreatorDashboard() {
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await CreatorService.getDashboard();
        setChatrooms(data.chatrooms || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-500/15 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute top-60 right-1/3 w-20 h-20 bg-purple-400/25 rounded-full blur-md animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/2 w-28 h-28 bg-cyan-500/20 rounded-full blur-lg animate-pulse delay-1500"></div>

        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-float-reverse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Creator Dashboard
        </h1>
        <p className="text-gray-400 mb-8 text-lg">Manage and continue your active business chats</p>

        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 text-purple-400 mr-2" />
            Active Chats
          </h2>

          {chatrooms.length > 0 ? (
            <div className="space-y-4">
              {chatrooms.map((chatroom) => (
                <div
                  key={chatroom.id}
                  onClick={() => navigate(`/chat/${chatroom.id}`)}
                  className="p-4 bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-700/70 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={chatroom.business_profile?.avatar || '/api/placeholder/40/40'}
                        alt={chatroom.business_username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors">
                        {chatroom.business_username}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(chatroom.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No active chats yet</p>
              <p className="text-gray-500 text-xs">Start connecting with businesses!</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(20px) translateX(-10px); }
          50% { transform: translateY(10px) translateX(15px); }
          75% { transform: translateY(25px) translateX(-5px); }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default CreatorDashboard;
