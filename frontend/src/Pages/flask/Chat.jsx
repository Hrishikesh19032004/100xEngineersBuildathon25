import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, Upload, Mic, Square, AlertCircle, Sparkles } from "lucide-react";
import VoiceComponent from "./VoiceComponent";
import DocumentComponent from "./DocumentComponent";
import Recommendation from "./Recommendation";

const InfluencerChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationRequirements, setRecommendationRequirements] = useState("");
  const messagesEndRef = useRef(null);

  // Use Document Component
  const {
    uploadedFiles,
    parsedText,
    showParsedPreview,
    processingError,
    handleFileUpload,
    insertParsedText,
    discardParsedText,
    removeFile,
    setProcessingError
  } = DocumentComponent({ inputText, setInputText, isProcessing, setIsProcessing });

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const userName = "AbhiyanSetu"; // You can make this dynamic
    
    if (hour >= 5 && hour < 12) {
      return `Good Morning! ${userName}.`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon! ${userName}.`;
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening! ${userName}.`;
    } else {
      return `Good Night! ${userName}.`;
    }
  };

  // Function to detect if message contains recommendation request
  const detectRecommendationRequest = (text) => {
    const keywords = [
      'recommend', 'suggestion', 'creators', 'influencers', 'campaign', 
      'budget', 'find me', 'get me', 'need', 'looking for', 'search for'
    ];
    
    const hasKeyword = keywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    const hasNumbers = /\d+/.test(text);
    
    return hasKeyword && hasNumbers;
  };
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Check if user is asking for recommendations
    if (detectRecommendationRequest(inputText)) {
      setRecommendationRequirements(inputText);
      
      // Add bot response indicating recommendation processing
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: "assistant",
          content: "I understand you're looking for creator recommendations! Let me analyze your requirements and find the perfect influencers for your campaign. Click 'View Recommendations' to see the results.",
          timestamp: new Date(),
          showRecommendationButton: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    } else {
      // Regular bot response
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: "assistant",
          content: "Thanks for your input! I'm analyzing your campaign needs and will help you create engaging content strategies. If you need creator recommendations, just tell me your budget, target audience, and campaign goals!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
    
    setInputText("");

    // Reset voice and document states
    if (window.resetVoiceTranscript) {
      window.resetVoiceTranscript();
    }
    if (window.resetDocumentState) {
      window.resetDocumentState();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-900 text-white flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          // Time-based Greeting - Only show when no messages
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-6 max-w-md mx-auto">
                <h1 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {getTimeBasedGreeting()}
                </h1>
                <p className="text-sm text-gray-400">
                  {getCurrentTime()}
                </p>
              </div>
              <div className="mt-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  Upload documents, speak your ideas, or type your campaign needs to get started.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Original welcome message and chat messages
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xl p-4 rounded-xl ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-1">{msg.timestamp.toLocaleTimeString()}</div>
                  
                  {/* Show recommendation button for bot messages that have recommendation */}
                  {msg.type === "assistant" && msg.showRecommendationButton && (
                    <button
                      onClick={() => setShowRecommendations(true)}
                      className="mt-3 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Recommendations
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-32">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-900/50 p-3 rounded border border-blue-700 text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
              <span>Processing document...</span>
            </div>
          )}

          {/* Processing Error */}
          {processingError && (
            <div className="bg-red-900/50 p-3 rounded border border-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{processingError}</span>
              <button
                type="button"
                onClick={() => setProcessingError("")}
                className="ml-auto text-red-400 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {/* Parsed Text Preview */}
          {showParsedPreview && (
            <div className="bg-gray-700 p-3 rounded border border-gray-600 text-sm">
              <div className="mb-2 font-semibold text-green-400">Extracted Text Preview:</div>
              <div className="max-h-40 overflow-auto mb-3 whitespace-pre-wrap bg-gray-800 p-2 rounded text-xs">
                {parsedText.length > 500 ? parsedText.substring(0, 500) + "..." : parsedText}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={insertParsedText}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs transition-colors"
                >
                  Add to Message
                </button>
                <button
                  type="button"
                  onClick={discardParsedText}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end gap-3">
            <textarea
              rows="3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Speak, upload documents, or type your campaign needs..."
              className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={isProcessing}
            />

            <div className="flex flex-col gap-2">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="p-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                disabled={isProcessing}
              >
                <Upload className="w-5 h-5" />
              </button>

              {/* Voice Component */}
              <VoiceComponent
                inputText={inputText}
                setInputText={setInputText}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                isProcessing={isProcessing}
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || isProcessing}
                className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            multiple={false}
          />
        </div>

        {/* Status Messages */}
        <div className="mt-2 text-center text-xs text-gray-400">
          {isRecording && "🎤 Recording in progress..."}
          {!isRecording && "Click the mic to start speaking"}
          {isProcessing && "Processing your document..."}
        </div>
      </div>

      {/* Recommendation Modal */}
      {showRecommendations && (
        <Recommendation
          requirements={recommendationRequirements}
          onClose={() => setShowRecommendations(false)}
        />
      )}
    </div>
  );
};

export default InfluencerChat;