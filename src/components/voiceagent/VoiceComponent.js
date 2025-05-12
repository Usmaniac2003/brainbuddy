"use client"

import { useEffect, useState } from "react"
import { useConversation } from "@11labs/react"
import { Mic, Volume2, VolumeX, ArrowLeft } from 'lucide-react'
import Link from "next/link"

const VoiceChat = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [characterState, setCharacterState] = useState("idle") // idle, listening, speaking

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs")
      setCharacterState("listening")
    },
    onDisconnect: () => {
      console.log("Disconnected")
      setCharacterState("idle")
    },
    onMessage: (message) => {
      console.log("Received:", message)
      // When receiving a message, set character to speaking
      if (message.type === "speech_started") {
        setCharacterState("speaking")
      } else if (message.type === "speech_ended") {
        setCharacterState("listening")
      }
    },
    onError: (error) => {
      setErrorMessage(typeof error === "string" ? error : error.message)
      console.error("Error:", error)
      setCharacterState("idle")
    },
  })

  const { status, isSpeaking } = conversation

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)
      } catch (error) {
        setErrorMessage("Microphone access denied")
      }
    }
    requestMicPermission()
  }, [])

  useEffect(() => {
    setCharacterState(isSpeaking ? "speaking" : status === "connected" ? "listening" : "idle")
  }, [isSpeaking, status])

  const toggleConversation = async () => {
    try {
      status === "connected"
        ? await conversation.endSession()
        : await conversation.startSession({
            agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
          })
    } catch (error) {
      setErrorMessage("Conversation error")
    }
  }

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 })
      setIsMuted(!isMuted)
    } catch (error) {
      setErrorMessage("Volume error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-purple-800 border-b border-purple-700 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center text-yellow-300 hover:text-yellow-200 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-bold">Back to Home</span>
          </Link>
          <div className="flex items-center">
            <Mic className="h-6 w-6 text-yellow-300 mr-2" />
            <h1 className="text-xl font-bold text-yellow-300">Talk to BrainyBuddy</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] w-4 h-4 rounded-full bg-yellow-300 opacity-30"></div>
          <div className="absolute top-[30%] right-[15%] w-3 h-3 rounded-full bg-yellow-300 opacity-20"></div>
          <div className="absolute bottom-[20%] left-[20%] w-5 h-5 rounded-full bg-yellow-300 opacity-25"></div>
          <div className="absolute top-[60%] right-[25%] w-4 h-4 rounded-full bg-yellow-300 opacity-30"></div>
          <div className="absolute bottom-[40%] left-[80%] w-3 h-3 rounded-full bg-yellow-300 opacity-20"></div>
        </div>

        {/* Character Circle - Centered and Larger */}
        <div className="relative mb-8">
          <div
            className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all duration-300 ${
              characterState === "speaking"
                ? "animate-pulse scale-105"
                : characterState === "listening"
                  ? "scale-100 border-4 border-yellow-400"
                  : "scale-95"
            }`}
          >
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-purple-700 flex items-center justify-center overflow-hidden">
              {/* Character Face */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Eyes */}
                <div className="flex space-x-12 mb-4">
                  <div
                    className={`w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center ${
                      characterState === "speaking" ? "animate-blink" : ""
                    }`}
                  >
                    <div className="w-4 h-4 bg-purple-900 rounded-full"></div>
                  </div>
                  <div
                    className={`w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center ${
                      characterState === "speaking" ? "animate-blink" : ""
                    }`}
                  >
                    <div className="w-4 h-4 bg-purple-900 rounded-full"></div>
                  </div>
                </div>

                {/* Mouth */}
                <div
                  className={`w-20 h-6 bg-yellow-300 rounded-full transition-all duration-200 ${
                    characterState === "speaking"
                      ? "h-10 rounded-2xl animate-talking"
                      : characterState === "listening"
                        ? "w-8 h-8 rounded-full"
                        : "w-16"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
              characterState === "speaking"
                ? "bg-yellow-400 text-purple-900"
                : characterState === "listening"
                  ? "bg-green-400 text-purple-900"
                  : "bg-purple-600 text-yellow-300"
            }`}
          >
            {characterState === "speaking"
              ? "Speaking..."
              : characterState === "listening"
                ? "Listening..."
                : "Ready to Talk"}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">Talk to BrainyBuddy!</h2>
          <p className="text-yellow-100 mb-4">
            Press the microphone button below and start talking! BrainyBuddy will listen and answer your questions.
          </p>
          {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Mic Button */}
          <button
            onClick={toggleConversation}
            disabled={!hasPermission}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 ${
              status === "connected"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-yellow-400 hover:bg-yellow-300 text-purple-900"
            } ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""} ${isSpeaking ? "animate-pulse" : ""}`}
          >
            <Mic className={`h-10 w-10 ${status === "connected" ? "text-white" : "text-purple-900"}`} />
          </button>

          {/* Volume Toggle */}
          {status === "connected" && (
            <button
              onClick={toggleMute}
              className="mt-4 bg-purple-700 hover:bg-purple-600 text-yellow-300 p-3 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
          )}

          <p className="text-yellow-200 text-sm mt-2">
            {status === "connected" ? "Tap to end conversation" : "Tap to start talking"}
          </p>
        </div>
      </div>

      {/* Add some keyframes for animations */}
      <style jsx global>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes talking {
          0%, 100% { height: 10px; border-radius: 10px; }
          50% { height: 15px; border-radius: 7px; }
        }
        .animate-blink {
          animation: blink 2s infinite;
        }
        .animate-talking {
          animation: talking 0.3s infinite;
        }
      `}</style>
    </div>
  )
}

export default VoiceChat

