"use client"

import { useState, useEffect } from "react"
import VoiceInput from "@/components/VoiceToText/VoiceInput"
import Link from "next/link"
import { MessageCircle, ArrowLeft, Send, Brain } from "lucide-react"

export default function Chat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container")
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages")
    // if (savedMessages) {
    //   setMessages(JSON.parse(savedMessages));
    // }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) throw new Error("API request failed")

      const data = await response.json()
      const updatedMessages = [...newMessages, { role: "assistant", content: data.content }]
      setMessages(updatedMessages)
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript)
    setIsProcessingVoice(false)
  }

  // Add a welcome message if there are no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi there! I'm BrainyBuddy. What would you like to chat about today? 😊",
        },
      ])
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Header */}
      <div className="bg-purple-800 border-b border-purple-700 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center text-yellow-300 hover:text-yellow-200 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-bold">Back to Home</span>
          </Link>
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 text-yellow-300 mr-2" />
            <h1 className="text-xl font-bold text-yellow-300">Chat with BrainyBuddy</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div id="chat-container" className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-3xl shadow-lg ${
                msg.role === "user"
                  ? "bg-purple-700 ml-8 border-2 border-purple-600"
                  : "bg-purple-600 mr-8 border-2 border-purple-500"
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`rounded-full p-1.5 ${msg.role === "user" ? "bg-yellow-300" : "bg-yellow-300"}`}>
                  {msg.role === "user" ? (
                    <div className="h-5 w-5 rounded-full bg-purple-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-yellow-300">You</span>
                    </div>
                  ) : (
                    <Brain className="h-5 w-5 text-purple-800" />
                  )}
                </div>
                <div className="ml-2 text-xs font-bold uppercase tracking-wide text-yellow-200">
                  {msg.role === "user" ? "You" : "BrainyBuddy"}
                </div>
              </div>
              <div className="text-yellow-100 whitespace-pre-wrap leading-relaxed pl-8">{msg.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-purple-800/90 backdrop-blur-sm border-t-2 border-purple-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-5 pr-16 py-4 bg-purple-700 border-2 border-purple-600 text-yellow-100 placeholder-yellow-200/60 rounded-2xl focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
                placeholder="Type or speak your message..."
                disabled={isLoading || isProcessingVoice}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading || isProcessingVoice} />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.2)]"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-purple-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <div className="flex items-center">
                  <span className="mr-1">Send</span>
                  <Send className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
