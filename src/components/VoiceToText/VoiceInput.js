'use client';
import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  // Wrap the onTranscript callback in useCallback to ensure it doesn't change between renders
  const handleTranscript = useCallback(
    (transcript) => {
      onTranscript(transcript);
    },
    [onTranscript]
  );

  useEffect(() => {
    const setupRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setBrowserSupport(false);
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => setIsListening(true);

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleTranscript(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionInstance.onend = () => setIsListening(false);

      setRecognition(recognitionInstance);
    };

    if (typeof window !== 'undefined') {
      setupRecognition();
      navigator.permissions.query({ name: 'microphone' }).catch(() => {});
    }

    // Cleanup recognition when component unmounts
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [handleTranscript,recognition]); // Only trigger this effect if handleTranscript changes

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
      <button disabled className="p-2 bg-gray-300 text-white rounded-full">
        <MicOff className="h-6 w-6" />
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
          : 'bg-black text-white hover:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? (
        <MicOff className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </button>
  );
};

export default VoiceInput;
