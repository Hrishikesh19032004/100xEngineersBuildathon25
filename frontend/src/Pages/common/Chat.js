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
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [dealConfirmed, setDealConfirmed] = useState(false);
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

  // Negotiation logic
  const negotiationResponses = [
    "We can offer a better rate if we proceed quickly!",
    "Let's adjust the deliverables to better fit your budget.",
    "Here's an improved offer based on your feedback.",
    "We've reviewed your proposal and suggest this revised offer.",
    "Let me provide an updated quotation for your consideration."
  ];

  const getLastQuotation = () => {
    return messages
      .filter(msg => msg.quotation)
      .slice(-1)[0]?.quotation;
  };

  const generateCounterOffer = (lastQuote) => {
    if (!lastQuote) return null;

    // Simple counteroffer logic - reduce amount by 10% and adjust deliverables
    const newAmount = Math.floor(lastQuote.amount * 0.9);
    const deliverables = lastQuote.deliverables.slice(0, -1); // Remove last deliverable

    return {
      amount: newAmount,
      currency: lastQuote.currency,
      deliverables: deliverables.length > 0 ? deliverables : ["basic package"]
    };
  };

  const handleNegotiation = async () => {
    if (!isNegotiating) return;

    try {
      setIsTyping(true);
      
      const lastQuote = getLastQuotation();
      if (!lastQuote) {
        setIsTyping(false);
        return;
      }

      const counterOffer = generateCounterOffer(lastQuote);
      const negotiationResponse = negotiationResponses[Math.floor(Math.random() * negotiationResponses.length)];

      // Create temporary negotiation message
      const tempNegotiationMessage = {
        id: `temp-nego-${Date.now()}`,
        content: negotiationResponse,
        sender_type: user.type,
        sender_name: user.type === 'business' ? user.business_name : user.name,
        sent_at: new Date().toISOString(),
        quotation: counterOffer
      };

      setMessages(prev => [...prev, tempNegotiationMessage]);

      // Send actual negotiation message
      await axios.post('http://localhost:5000/api/chat/message', {
        session_id: sessionId,
        content: negotiationResponse,
        quotation: counterOffer
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Refresh messages
      const response = await axios.get(`http://localhost:5000/api/chat/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(response.data);
      
      setIsNegotiating(false);
      setIsTyping(false);
    } catch (err) {
      setError('Negotiation failed');
      setIsTyping(false);
    }
  };

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
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      if (quotation) {
        setIsNegotiating(true);
      }

      await axios.post('http://localhost:5000/api/chat/message', {
        session_id: sessionId,
        content: newMessage.trim(),
        quotation: tempMessage.quotation
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const response = await axios.get(`http://localhost:5000/api/chat/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(response.data);
      
      if (quotation) {
        setQuotation(null);
        setShowQuotationForm(false);
      }
    } catch (err) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  useEffect(() => {
    if (isNegotiating) {
      const negotiationTimeout = setTimeout(() => {
        handleNegotiation();
      }, 1500);

      return () => clearTimeout(negotiationTimeout);
    }
  }, [isNegotiating]);

  const sendConfirmationEmail = async () => {
    if (!user.email || !recipient?.email) {
      setError('Email addresses not available');
      return;
    }
  
    const lastQuote = getLastQuotation();
    if (!lastQuote) {
      setError('No quotation found to confirm');
      return;
    }
  
    try {
      console.log('Attempting to send confirmation email');
      const response = await axios.post('http://localhost:5000/send-confirmation-email', {
        senderEmail: user.email,
        recipientEmail: recipient.email,
        subject: "Deal Confirmation - AbhiyanSetu",
        body: `
          Hi ${recipient.name || recipient.business_name},
          
          This is to confirm the deal with the following details:
          
          Amount: ${lastQuote.amount} ${lastQuote.currency}
          Deliverables: ${lastQuote.deliverables.join(', ')}
          
          Best regards,
          ${user.business_name || user.name}
        `
      });
  
      console.log('Email sending response:', response.data);
      setDealConfirmed(true);
      setError('');
    } catch (err) {
      console.error('Email sending error:', err);
      setError('Failed to send confirmation email. Details: ' + err.message);
    }
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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white flex flex-col px-4 py-4 overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <div className="bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-2xl">
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
        </div>
      </div>

      <div className="flex-1 min-h-0 mb-4">
        <div className="h-full overflow-y-auto p-4 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
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
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => {
                return (
                  <div
                    key={message.id}
                    className={`flex justify-center animate-fadeInUp`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white transform hover:scale-[1.02]`}
                    >
                      {message.sender_name && (
                        <div className="font-semibold text-sm mb-2 opacity-80">
                          {message.sender_name}
                        </div>
                      )}
                      
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
                );
              })}

              {/* Confirm Deal Button */}
              {messages.some(msg => msg.quotation) && user.type === 'business' && !dealConfirmed && (
                <div className="flex justify-center mt-4">
                  {/* <button
                    onClick={sendConfirmationEmail}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Confirm Deal
                  </button> */}
                </div>
              )}

              {dealConfirmed && (
                <div className="flex justify-center mt-4">
                  <div className="bg-green-800/80 backdrop-blur-sm p-4 rounded-xl text-center">
                    <div className="text-green-400 text-xl mb-2">
                      <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-white font-medium">
                      Deal confirmed! Email sent to {recipient?.email}
                    </div>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-center animate-fadeInUp">
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

      <div className="flex-shrink-0">
        <div className="bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-2xl">
          {showQuotationForm && (
            <div className="mb-4 p-4 border border-gray-600/50 rounded-xl bg-gray-700/50 backdrop-blur-sm animate-slideDown">
              <div className="flex justify-between items-center mb-3">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                  <input
                    type="number"
                    value={quotation?.amount || ''}
                    onChange={(e) => setQuotation(prev => ({ 
                      ...(prev || {}), 
                      amount: e.target.value 
                    }))}
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <select
                    value={quotation?.currency || 'USD'}
                    onChange={(e) => setQuotation(prev => ({ 
                      ...(prev || {}), 
                      currency: e.target.value 
                    }))}
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white transition-all duration-200"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Deliverables</label>
                <textarea
                  value={quotation?.deliverables || ''}
                  onChange={(e) => setQuotation(prev => ({ 
                    ...(prev || {}), 
                    deliverables: e.target.value 
                  }))}
                  className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="List deliverables separated by commas"
                  rows="2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Example: 60-second video, 3 Instagram stories, 1 TikTok post
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setQuotation(null)}
                  className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-grow relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>
            
            {user.type === 'business' || user.type === 'creator' ? (
              <button
                type="button"
                onClick={() => setShowQuotationForm(prev => !prev)}
                className={`px-4 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 ${
                  showQuotationForm 
                    ? 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 hover:shadow-pink-500/25' 
                    : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:shadow-pink-500/25'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Quote</span>
              </button>
            ) : null}
            
            <button
              type="submit"
              disabled={!newMessage.trim() && !quotation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {isNegotiating && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full text-white text-sm font-medium">
          Negotiating automatically...
        </div>
      )}

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