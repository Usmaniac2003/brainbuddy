'use client';
import { useState, useEffect } from 'react';
import VoiceInput from '@/components/VoiceInput';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    // if (savedMessages) {
    //   setMessages(JSON.parse(savedMessages));
    // }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.content }];
      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    setIsProcessingVoice(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages Container */}
      <div 
        id="chat-container"
        className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 pt-6"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i}
              className={`p-4 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-blue-50 ml-8 border border-blue-200'
                  : 'bg-gray-50 mr-8 border border-gray-200'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-16 py-4 bg-white border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Type or speak your message..."
                disabled={isLoading || isProcessingVoice}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading || isProcessingVoice}
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl 
                       disabled:opacity-50 transition-all flex items-center justify-center"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <span className="font-medium">Send</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}