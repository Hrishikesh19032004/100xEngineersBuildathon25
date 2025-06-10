import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Volume2, Loader2, AlertCircle } from 'lucide-react';

const SpeechToText = ({ onTranscriptionComplete, onError, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  // Timer effect
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
      setError('');
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
        setAudioUrl(url);
        processAudio(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);
      setTranscription('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
      if (onError) onError('Microphone access denied');
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

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError('');

    try {
      // Convert blob to base64 for sending to backend
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Simulate API call to backend with Hugging Face Whisper
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
      setTranscription(transcribedText);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete({
          text: transcribedText,
          language: result.language || 'unknown',
          confidence: result.confidence || 0,
          audioBlob: audioBlob,
          audioUrl: audioUrl
        });
      }

    } catch (error) {
      console.error('Transcription error:', error);
      
      // Fallback: Use Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        await fallbackToWebSpeechAPI(audioBlob);
      } else {
        // Demo transcription for development
        const demoText = "I'm looking for fitness influencers with over 100k followers who focus on home workouts and have high engagement rates.";
        setTranscription(`[Demo] ${demoText}`);
        setError('Using demo transcription. Backend not connected.');
        
        if (onTranscriptionComplete) {
          onTranscriptionComplete({
            text: demoText,
            language: 'en',
            confidence: 0.95,
            audioBlob: audioBlob,
            audioUrl: audioUrl,
            isDemo: true
          });
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackToWebSpeechAPI = async (audioBlob) => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Can be made dynamic
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        setTranscription(transcript);
        if (onTranscriptionComplete) {
          onTranscriptionComplete({
            text: transcript,
            language: 'en',
            confidence: confidence,
            audioBlob: audioBlob,
            audioUrl: audioUrl,
            source: 'web-speech-api'
          });
        }
        resolve(transcript);
      };
      
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        reject(event.error);
      };
      
      // This is a limitation - Web Speech API needs live audio, not recorded blob
      setError('Fallback to Web Speech API requires live recording');
      reject('Cannot process recorded audio with Web Speech API');
    });
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setTranscription('');
    setError('');
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Speech to Text</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Multilingual Support
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">
                {isPaused ? 'Paused' : 'Recording'}
              </span>
              <span className="text-white font-mono text-lg">
                {formatTime(recordingTime)}
              </span>
            </div>
            
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <span className="text-gray-300">
            Converting speech to text using Whisper AI...
          </span>
        </div>
      )}

      {/* Audio Playback */}
      {audioUrl && !isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={playAudio}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Play Recording
            </button>
            <button
              onClick={resetRecording}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Record New
            </button>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Transcription Result:
          </label>
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
            <p className="text-white whitespace-pre-wrap">{transcription}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 text-center">
        Supports multiple languages • Powered by Whisper AI • High accuracy transcription
      </div>
    </div>
  );
};

export default SpeechToText;