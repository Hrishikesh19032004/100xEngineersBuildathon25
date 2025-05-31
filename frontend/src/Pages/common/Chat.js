import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Chat() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [quotation, setQuotation] = useState(null);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);

        const messagesResponse = await axios.get(`http://localhost:5000/api/chat/${sessionId}/messages`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMessages(messagesResponse.data);

        const recipientResponse = await axios.get(`http://localhost:5000/api/chat/${sessionId}/recipient`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRecipient(recipientResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load chat data');
        setLoading(false);
      }
    };

    fetchChatData();
  }, [sessionId, user.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !quotation) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      quotation: quotation
        ? {
            amount: quotation.amount,
            currency: quotation.currency,
            deliverables: quotation.deliverables.split(',').map(d => d.trim())
          }
        : null,
      sender_type: user.type,
      sender_name: user.type === 'business' ? user.business_name : user.name,
      sent_at: new Date().toISOString()
    };

    try {
      const messageData = {
        session_id: sessionId,
        content: newMessage.trim(),
        quotation: tempMessage.quotation
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setQuotation(null);
      setShowQuotationForm(false);
      setIsTyping(true);

      await axios.post('http://localhost:5000/api/chat/message', messageData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const response = await axios.get(`http://localhost:5000/api/chat/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(response.data);
      setIsTyping(false);
    } catch (err) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  if (loading)
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

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 text-white px-4 pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-medium text-red-400">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white flex flex-col px-4 pt-20">
      {/* Enhanced Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-6 flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-medium transition-all duration-200 hover:translate-x-[-2px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {(recipient?.name || recipient?.business_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {recipient?.name || recipient?.business_name || 'Chat'}
                </h1>
                {recipient?.channel_name && (
                  <p className="text-sm text-purple-400 font-medium">@{recipient.channel_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="max-w-7xl mx-auto flex-1 mb-6">
        <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="relative mb-8">
                <div className="text-8xl opacity-20">💬</div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl"></div>
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                No messages yet
              </h2>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                Start the conversation with {user.type === 'business' ? 'the creator' : 'the business'}
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === user.type ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`min-w-[300px] w-full max-w-[85%] rounded-2xl p-5 shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.sender_type === user.type
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 rounded-br-md text-white transform hover:scale-[1.02]'
                        : 'bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-bl-md text-gray-100 transform hover:scale-[1.02]'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-2 opacity-80">
                      {message.sender_name}
                    </div>
                    {message.content && (
                      <div className="mb-3 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    )}

                    {message.quotation && (
                      <div className="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/30">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                          <div className="font-semibold text-pink-400">Quotation Offer</div>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center">
                            <span className="font-medium w-24 text-gray-300">Amount:</span>
                            <span className="font-bold text-green-400 text-lg">
                              {message.quotation.amount} {message.quotation.currency}
                            </span>
                          </p>
                          <div>
                            <p className="font-medium mb-2 text-gray-300">Deliverables:</p>
                            <ul className="space-y-1">
                              {message.quotation.deliverables.map((item, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-gray-200">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-300 mt-3 opacity-60">
                      {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fadeInUp">
                  <div className="bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-2xl rounded-bl-md p-4 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-100"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Message Input Form */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
          {showQuotationForm && (
            <div className="mb-6 p-5 border border-gray-600/50 rounded-xl bg-gray-700/50 backdrop-blur-sm animate-slideDown">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-pink-400 flex items-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Quotation Details
                </h3>
                <button
                  onClick={() => setShowQuotationForm(false)}
                  className="text-gray-400 hover:text-pink-400 font-bold text-xl transition-colors hover:rotate-90 duration-200"
                  aria-label="Close quotation form"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-300 text-sm">
                Quotation form inputs would go here with enhanced styling...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-6 py-4 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-200 text-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowQuotationForm(prev => !prev)}
              className="px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Quote</span>
            </button>
            
            <button
              type="submit"
              disabled={!newMessage.trim() && !quotation}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}