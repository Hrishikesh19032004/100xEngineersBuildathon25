import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Upload, File, X, Play, Pause, Square, Volume2, Loader2, AlertCircle } from 'lucide-react';

const InfluencerChat = () => {
  // Helper function to get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `${getGreeting()}! **AbhiyanSetu**.`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const streamRef = useRef(null);
  const audioPlaybackRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setTranscriptionError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        handleVoiceMessage(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedAudioUrl(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setTranscriptionError('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    setTranscriptionError('');

    try {
      // Convert blob to array buffer for backend
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Send to backend with Hugging Face Whisper
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: Array.from(uint8Array),
          model: 'openai/whisper-large-v3', // Multilingual model
          language: 'auto', // Auto-detect language
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const transcribedText = result.text || result.transcription || '';
      
      return {
        text: transcribedText,
        language: result.language || 'auto-detected',
        confidence: result.confidence || 0.95
      };

    } catch (error) {
      console.error('Transcription error:', error);
      
      // Fallback: Try Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          return await fallbackWebSpeechAPI();
        } catch (fallbackError) {
          console.error('Web Speech API fallback failed:', fallbackError);
        }
      }
      
      // Demo transcription for development/testing
      const demoTexts = [
        "I'm looking for fitness influencers with over 100k followers who focus on home workouts and have high engagement rates.",
        "Can you help me find beauty influencers in the age group 20-30 with authentic content and good brand partnerships?",
        "I need travel bloggers from India who create content about budget travel and have audience primarily from tier 2 cities.",
        "Find me tech reviewers who specialize in smartphone reviews and have consistent posting schedules."
      ];
      
      const randomDemo = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      setTranscriptionError('Backend not available. Using demo transcription.');
      
      return {
        text: randomDemo,
        language: 'en',
        confidence: 0.95,
        isDemo: true
      };
    } finally {
      setIsTranscribing(false);
    }
  };

  const fallbackWebSpeechAPI = () => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        reject('Web Speech API not supported');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        resolve({
          text: transcript,
          language: 'en',
          confidence: confidence
        });
      };
      
      recognition.onerror = (event) => {
        reject(`Speech recognition error: ${event.error}`);
      };
      
      // Note: This is a limitation - Web Speech API can't process recorded blobs
      reject('Web Speech API requires live recording, cannot process recorded audio');
    });
  };

  const handleVoiceMessage = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Transcribe the audio
      const transcriptionResult = await transcribeAudio(audioBlob);
      
      // Create message with transcribed text
      const newMessage = {
        id: Date.now(),
        type: 'user',
        content: transcriptionResult.text,
        audioBlob: audioBlob,
        audioUrl: recordedAudioUrl,
        isVoice: true,
        language: transcriptionResult.language,
        confidence: transcriptionResult.confidence,
        isDemo: transcriptionResult.isDemo || false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      await processMessage(transcriptionResult.text);
    } catch (error) {
      console.error('Voice message processing error:', error);
      setTranscriptionError('Failed to process voice message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Create message with file info
    const fileMessage = {
      id: Date.now(),
      type: 'user',
      content: `Uploaded ${newFiles.length} document(s): ${newFiles.map(f => f.name).join(', ')}`,
      files: newFiles,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, fileMessage]);
    
    // Simulate document processing
    setTimeout(() => {
      processDocuments(newFiles);
    }, 1000);
  };

  const processDocuments = async (files) => {
    setIsProcessing(true);
    
    // Simulate document parsing and processing
    const mockResponse = `I've analyzed your ${files.length} document(s). Based on the campaign brief, I understand you're looking for:

• **Target Audience**: 18-35 year olds interested in sustainable fashion
• **Budget Range**: $10,000 - $50,000
• **Campaign Duration**: 3 months
• **Key Requirements**: Authentic content creators with strong engagement

Let me find matching influencers and prepare negotiation strategies for you.`;

    const responseMessage = {
      id: Date.now(),
      type: 'assistant',
      content: mockResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, responseMessage]);
    setIsProcessing(false);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    await processMessage(inputText);
  };

  const processMessage = async (message) => {
    setIsProcessing(true);
    
    // Simulate AI processing with LangChain pipeline
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResponse = `I've analyzed your requirements and I'm processing this through our AI pipeline:

🎯 **Requirement Extraction**: Identified key campaign parameters
🔍 **Influencer Matching**: Searching our database of 50,000+ influencers
📝 **Brief Generation**: Creating personalized outreach templates
💼 **Negotiation Engine**: Preparing optimal terms based on market data

**Top 3 Recommended Matches:**

1. **@fitnessguru_sarah** - 250K followers, 8.5% engagement
   - Niche: Home fitness & wellness
   - Rate: $2,500/post | Negotiable to $2,000

2. **@homeworkout_king** - 180K followers, 12.3% engagement
   - Niche: Equipment-free workouts
   - Rate: $1,800/post | Negotiable to $1,500

3. **@wellness_warrior** - 320K followers, 6.8% engagement
   - Niche: Holistic fitness lifestyle
   - Rate: $3,200/post | Negotiable to $2,800

Would you like me to generate personalized outreach messages or explore additional negotiation strategies?`;

    const assistantMessage = {
      id: Date.now(),
      type: 'assistant',
      content: mockResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const playRecordedAudio = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col pt-20">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-xl p-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                {message.isVoice && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <Mic className="w-4 h-4" />
                      <span>Voice message transcribed</span>
                      {message.language && (
                        <span className="bg-gray-700/50 px-2 py-1 rounded text-xs">
                          {message.language}
                        </span>
                      )}
                      {message.confidence && (
                        <span className="bg-green-700/50 px-2 py-1 rounded text-xs">
                          {Math.round(message.confidence * 100)}% confidence
                        </span>
                      )}
                      {message.isDemo && (
                        <span className="bg-yellow-700/50 px-2 py-1 rounded text-xs">
                          Demo
                        </span>
                      )}
                    </div>
                    {message.audioUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={playRecordedAudio}
                          className="flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                          Play Original
                        </button>
                        <audio
                          ref={audioPlaybackRef}
                          src={message.audioUrl}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                )}
                {message.files && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2 text-sm">
                        <File className="w-4 h-4" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  {message.content.split('\n').map((line, index) => {
                    if (line.includes('**') && index === 0) {
                      // Handle the greeting line with bold AbhiyanSetu - increased size by 30%
                      const parts = line.split('**');
                      return (
                        <h1 key={index} className="text-3xl font-bold mb-2">
                          {parts[0]}
                          {parts[1] && <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{parts[1]}</span>}
                          {parts[2]}
                        </h1>
                      );
                    }
                    return <div key={index}>{line}</div>;
                  })}
                </div>
                <div className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {(isProcessing || isTranscribing) && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  <span className="text-gray-400">
                    {isTranscribing ? 'Converting speech to text using Whisper AI...' : 'AI is analyzing your request...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Transcription Error */}
      {transcriptionError && (
        <div className="bg-yellow-900/20 border-t border-yellow-700 p-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-sm">{transcriptionError}</span>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-800/30 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2 text-sm">
                  <File className="w-4 h-4" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recording Interface */}
      {isRecording && (
        <div className="bg-red-900/20 border-t border-red-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400">
                  {isPaused ? 'Recording Paused' : 'Recording'}
                </span>
              </div>
              <span className="text-white font-mono">{formatTime(recordingTime)}</span>
              <div className="text-xs text-gray-400">
                Multilingual • Powered by Whisper AI
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your influencer campaign needs, upload documents, or use voice input..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                rows="3"
                disabled={isProcessing || isTranscribing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit(e);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Voice Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || isTranscribing}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
              
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isTranscribing}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing || isTranscribing}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Voice: Multilingual support via Whisper AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerChat;