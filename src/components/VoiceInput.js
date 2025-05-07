'use client';
import { useState, useEffect } from 'react';

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  useEffect(() => {
    const setupRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setBrowserSupport(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => setIsListening(false);

      setRecognition(recognition);
    };

    if (typeof window !== 'undefined') {
      setupRecognition();
      navigator.permissions.query({ name: 'microphone' }).catch(() => {});
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  if (!browserSupport) {
    return (
      <button disabled className="p-2 bg-gray-300 rounded-full">
        🎤 (Not Supported)
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2 rounded-full ${
        isListening 
          ? 'bg-red-500 animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? '🛑' : '🎤'}
    </button>
  );
};

export default VoiceInput;