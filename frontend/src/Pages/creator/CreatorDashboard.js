import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function CreatorDashboard() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/creator/chats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setChats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load chats');
        setLoading(false);
      }
    };

    fetchChats();
  }, [user.token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 bg-gray-900 text-white">
      <div className="text-lg text-gray-400">Loading messages...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64 bg-gray-900 text-red-400">
      <div className="text-lg">{error}</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white px-4 py-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-semibold">Your Messages</h1>
      </header>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-xl shadow-md p-8 text-center mx-auto max-w-md">
          <div className="text-purple-400 mb-6 w-24 h-24">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white">No Messages Yet</h2>
          <p className="text-gray-400 mb-6 max-w-xs">
            Businesses haven't reached out to you yet. Your profile is now visible 
            to businesses in our directory. You'll be notified when someone contacts you.
          </p>
          <Link 
            to="/creator/profile" 
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition"
          >
            Improve Your Profile
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {chats.map(chat => (
              <li key={chat.session_id} className="hover:bg-gray-700 transition">
                <Link 
                  to={`/chat/${chat.session_id}`} 
                  className="block p-6 flex items-center"
                >
                  <div className="bg-gray-700 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-white truncate">{chat.business_name}</h2>
                      <span className="text-xs text-gray-400">
                        {/* You can add last active time here */}
                      </span>
                    </div>
                    <p className="text-gray-300 truncate mt-1">
                      {chat.last_message || 'New conversation started'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
