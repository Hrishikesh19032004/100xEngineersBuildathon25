import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZIMKitManager, Common } from '@zegocloud/zimkit-react';
import '@zegocloud/zimkit-react/index.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function ZegoChat() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Initialize ZIMKit with user credentials
        const appConfig = {
          appID: 0, // Your ZegoCloud App ID
          serverSecret: '' // Your ZegoCloud Server Secret
        };

        const userInfo = {
          userID: user.id.toString(),
          userName: user.business_name || user.name || 'User'
        };

        await ZIMKitManager.init(appConfig.appID);
        await ZIMKitManager.connectUser(userInfo, token => {
          return axios.post('http://localhost:5000/api/zego-token', {
            userID: user.id.toString()
          }).then(res => res.data.token);
        });

        // Create conversation ID (business_<id>_creator_<id>)
        const [businessId, creatorId] = sessionId.split('_').slice(1);
        const conversationID = `business_${businessId}_creator_${creatorId}`;
        
        // Create conversation config
        const conversationConfig = {
          conversationID,
          conversationType: Common.ConversationType.Peer,
          conversationName: recipient?.name || 'Chat'
        };

        // Create chat instance
        ZIMKitManager.createChat(conversationConfig, chatContainerRef.current);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    };

    const fetchRecipient = async () => {
      try {
        const [businessId, creatorId] = sessionId.split('_').slice(1);
        const id = user.type === 'business' ? creatorId : businessId;
        
        const endpoint = user.type === 'business' 
          ? `/api/creator/${id}`
          : `/api/business/${id}`;
        
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        setRecipient(response.data);
        initChat();
      } catch (err) {
        setError('Failed to load recipient information');
        setLoading(false);
      }
    };

    fetchRecipient();
  }, [sessionId, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white px-4 pt-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-xl font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Loading chat...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 text-white px-4 pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-medium text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <div className="p-4 bg-gray-800/60 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center">
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">
                {(recipient?.name || recipient?.business_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {recipient?.name || recipient?.business_name || 'Chat'}
            </h1>
            {recipient?.channel_name && (
              <p className="text-sm text-purple-400 font-medium">@{recipient.channel_name}</p>
            )}
          </div>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 min-h-0"></div>
    </div>
  );
}