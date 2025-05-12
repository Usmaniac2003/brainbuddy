"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { Rocket, Brain, BookOpen, Calculator, MessageCircle, Mic } from "lucide-react"

export default function LandingPage() {
  const containerRef = useRef(null)

  useEffect(() => {
    // Simple one-time animations on load only
    const ctx = gsap.context(() => {
      // Simple fade-in for the title
      gsap.fromTo(".title-container", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })

      // Simple fade-in for boxes with slight stagger
      gsap.fromTo(
        ".box",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power1.out",
          stagger: 0.1,
          clearProps: "all", // Clear all props after animation to prevent conflicts
        },
      )
    }, containerRef)

    return () => ctx.revert() // Clean up animations
  }, [])

  const boxes = [
    {
      title: "Chat with BrainyBuddy",
      href: "/Chat",
      icon: <MessageCircle className="size-8 mb-2" />,
      description: "Ask questions and get smart answers!",
    },
    {
      title: "Talk to BrainyBuddy",
      href: "/Talk",
      icon: <Mic className="size-8 mb-2" />,
      description: "Speak and listen to your buddy!",
    },
    {
      title: "Learn & Visualize",
      href: "/Visualize",
      icon: <BookOpen className="size-8 mb-2" />,
      description: "See cool pictures that help you learn!",
    },
    {
      title: "Do Math with BrainyBuddy",
      href: "/Math",
      icon: <Calculator className="size-8 mb-2" />,
      description: "Make math fun and easy!",
    },
  ]

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col items-center p-4 md:p-6 relative"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-20 pointer-events-none"></div>

      {/* Static decorative background - using CSS only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-4 h-4 rounded-full bg-yellow-300 opacity-30"></div>
        <div className="absolute top-[30%] right-[15%] w-3 h-3 rounded-full bg-yellow-300 opacity-20"></div>
        <div className="absolute bottom-[20%] left-[20%] w-5 h-5 rounded-full bg-yellow-300 opacity-25"></div>
        <div className="absolute top-[60%] right-[25%] w-4 h-4 rounded-full bg-yellow-300 opacity-30"></div>
        <div className="absolute bottom-[40%] left-[80%] w-3 h-3 rounded-full bg-yellow-300 opacity-20"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Header */}
        <div className="title-container mb-8 md:mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-yellow-300 size-12 md:size-16 mr-4" />
            <Rocket className="text-yellow-300 size-12 md:size-16" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-yellow-300 mb-4 leading-tight">
            BrainyBuddy
          </h1>
          <p className="text-xl md:text-2xl font-bold text-yellow-200 max-w-2xl">
            Your super fun learning friend that makes being smart awesome!
          </p>
        </div>

        {/* Boxes grid - using CSS transitions for hover effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full">
          {boxes.map((box, idx) => (
            <Link
              key={idx}
              href={box.href}
              className="box block bg-purple-700 hover:bg-purple-600 rounded-3xl py-6 px-6 text-center shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex flex-col items-center">
                <div className="text-yellow-300 mb-2">{box.icon}</div>
                <h2 className="font-bold text-yellow-300 text-xl md:text-2xl mb-2">{box.title}</h2>
                <p className="text-yellow-200 text-sm md:text-base">{box.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Fun character */}
        <div className="mt-12 bg-purple-600 rounded-full p-6 shadow-lg transform rotate-3">
          <div className="text-yellow-300 text-xl md:text-2xl font-bold">Ready to have fun learning? Let's go! 🚀</div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-sm text-yellow-200 opacity-80 rounded-full bg-purple-800 px-6 py-2">
          Made with 💖 by Team BrainyBuddy
        </footer>
      </div>
    </div>
  )
}
