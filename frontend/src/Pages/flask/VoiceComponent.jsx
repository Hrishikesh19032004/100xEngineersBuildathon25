import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, Upload, Mic, Square, AlertCircle, Pause, Play, StopCircle } from "lucide-react";

// Enhanced Voice Component with Popup
const VoiceComponent = ({ 
  inputText, 
  setInputText, 
  isRecording, 
  setIsRecording, 
  isProcessing 
}) => {
  const recognition = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setShowVoicePopup(false);
        setIsPaused(false);
      };

      recognition.current.onend = () => {
        if (!isPaused) {
          setIsRecording(false);
          setShowVoicePopup(false);
        }
      };

      setBrowserSupportsSpeechRecognition(true);
    }
  }, [isPaused, setIsRecording]);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const beautifyTranscript = (raw) => {
    if (!raw) return "";
    let text = raw.trim();
    if (text.length === 0) return "";
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) text += ".";
    return text;
  };

  useEffect(() => {
    if (transcript) {
      const cleaned = beautifyTranscript(transcript);
      setInputText(cleaned);
    }
  }, [transcript, setInputText]);

  const startListening = () => {
    if (recognition.current && !isRecording) {
      setTranscript("");
      setRecordingTime(0);
      setIsPaused(false);
      setIsRecording(true);
      setShowVoicePopup(true);
      recognition.current.start();
    }
  };

  const pauseRecording = () => {
    if (recognition.current && isRecording) {
      recognition.current.stop();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (recognition.current && isPaused) {
      setIsPaused(false);
      recognition.current.start();
    }
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsRecording(false);
      setShowVoicePopup(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setRecordingTime(0);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Expose reset function
  useEffect(() => {
    window.resetVoiceTranscript = resetTranscript;
    return () => {
      delete window.resetVoiceTranscript;
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      {/* Voice Popup */}
      {showVoicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 mx-4 w-full max-w-md border border-gray-600">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {isPaused ? 'Paused' : isRecording ? 'Recording' : 'Ready'}
                </span>
              </div>
              <span className="text-gray-400 text-sm font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Status Message */}
            <div className="text-center mb-6">
              <div className="text-gray-300 text-sm mb-2">
                {isPaused ? 'Recording paused' : isRecording ? 'Listening...' : 'Ready to record'}
              </div>
              <div className="text-xs text-gray-500">
                Multilingual • Powered by Browser Speech API
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {/* Pause/Resume Button */}
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={!isRecording && !isPaused}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopRecording}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Stop"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Current Transcript Preview */}
            {transcript && (
              <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">Current transcript:</div>
                <div className="text-sm text-white max-h-20 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Button */}
      <button
        type="button"
        onClick={startListening}
        disabled={isProcessing || isRecording}
        className={`p-3 rounded-lg transition-all duration-300 ${
          isRecording
            ? 'bg-red-600 cursor-not-allowed opacity-75'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Mic className="w-5 h-5" />
      </button>
    </>
  );
};

export default VoiceComponent;