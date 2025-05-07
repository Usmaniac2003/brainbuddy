"use client";
import React, { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Mic, Volume2, VolumeX } from "lucide-react";

const VoiceChat = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const conversation = useConversation({
    onConnect: () => console.log("Connected to ElevenLabs"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Received:", message),
    onError: (error) => {
      setErrorMessage(typeof error === "string" ? error : error.message);
      console.error("Error:", error);
    },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (error) {
        setErrorMessage("Microphone access denied");
      }
    };
    requestMicPermission();
  }, []);

  const toggleConversation = async () => {
    try {
      status === "connected" 
        ? await conversation.endSession()
        : await conversation.startSession({
            agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
          });
    } catch (error) {
      setErrorMessage("Conversation error");
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      setErrorMessage("Volume error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Voice Circle */}
        <button
          onClick={toggleConversation}
          disabled={!hasPermission}
          className={`w-full h-full rounded-full flex items-center justify-center transition-all
            ${status === "connected" 
              ? "bg-red-500 hover:bg-red-600 scale-105 shadow-lg" 
              : "bg-blue-500 hover:bg-blue-600"}
            ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""}
            ${isSpeaking ? "animate-pulse" : ""}
          `}
        >
          <Mic className="h-12 w-12 text-white" />
        </button>

        {/* Mute Button */}
        {/* <button
          onClick={toggleMute}
          className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg"
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-gray-700" />
          ) : (
            <Volume2 className="h-6 w-6 text-gray-700" />
          )}
        </button> */}
      </div>

      {/* Status Messages */}
      <div className="mt-8 text-center space-y-2">
        {status === "connected" && (
          <p className="text-green-600 font-medium">
            {isSpeaking ? "Agent is speaking..." : "Listening..."}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-500 font-medium">{errorMessage}</p>
        )}
        {!hasPermission && (
          <p className="text-yellow-600 font-medium">
            Please enable microphone access
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;