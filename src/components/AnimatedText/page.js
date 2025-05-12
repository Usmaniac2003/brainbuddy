"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ArrowLeft, Mic } from "lucide-react";
import Link from "next/link";

export default function AnimatedSummary() {
  const [prompt, setPrompt] = useState("");
  const [animatedText, setAnimatedText] = useState([]);
  const [error, setError] = useState("");
  const [animationType, setAnimationType] = useState("bounce");
  const textRef = useRef([]);
  const timeline = useRef(null);
  const containerRef = useRef(null);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#FF9999",
    "#FFD700",
    "#7B68EE",
    "#40E0D0",
    "#FFA07A",
  ];

  useEffect(() => {
    return () => {
      timeline.current?.progress(0).kill();
      gsap.globalTimeline.clear();
    };
  }, []);

  useEffect(() => {
    if (!textRef.current.length || !containerRef.current) return;

    timeline.current?.progress(0).kill();
    gsap.killTweensOf(textRef.current);

    gsap.set(textRef.current, {
      opacity: 1,
      y: 0,
      x: 0,
      rotation: 0,
      scale: 1,
      backgroundColor: "transparent",
      textShadow: "none",
      borderRight: "none",
    });

    timeline.current = gsap.timeline({ repeat: -1 });

    switch (animationType) {
      case "bounce":
        timeline.current.from(textRef.current, {
          duration: 1,
          y: 100,
          opacity: 0,
          scale: 0.5,
          ease: "elastic.out(1, 0.3)",
          stagger: 0.1,
        });
        break;

      case "wave":
        timeline.current.to(textRef.current, {
          duration: 1,
          y: -30,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.1,
        });
        break;

      case "spin":
        timeline.current.from(textRef.current, {
          duration: 1.5,
          rotation: 720,
          opacity: 0,
          ease: "power4.out",
          stagger: 0.1,
        });
        break;

      case "neon":
        timeline.current.to(
          textRef.current,
          {
            duration: 1,
            textShadow: "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff00de",
            repeat: -1,
            yoyo: true,
            stagger: 0.1,
          },
          0
        );
        break;

      case "flip":
        timeline.current.from(textRef.current, {
          duration: 1,
          rotationX: 180,
          opacity: 0,
          ease: "power4.out",
          stagger: 0.1,
        });
        break;

      case "highlight":
        timeline.current.to(textRef.current, {
          duration: 1,
          backgroundColor: "#FFD700",
          color: "#000",
          padding: "0.2em",
          borderRadius: "4px",
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
        });
        break;

      case "shadow":
        timeline.current.to(textRef.current, {
          duration: 1,
          textShadow: "4px 4px 0px rgba(0,0,0,0.2)",
          y: -5,
          x: -5,
          repeat: -1,
          yoyo: true,
          stagger: 0.1,
        });
        break;

      case "typewriter":
        gsap.set(textRef.current, { opacity: 0 });
        timeline.current.to(textRef.current, {
          duration: 0.5,
          opacity: 1,
          color: "#FFD700",
          borderRight: "2px solid white",
          ease: "power2.inOut",
          stagger: 0.1,
        });
        break;
    }

    return () => timeline.current?.progress(0).kill();
  }, [animatedText, animationType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    timeline.current?.progress(0).kill();
    textRef.current = [];

    if (!prompt.trim()) {
      setError("Please enter a prompt!");
      return;
    }

    try {
      const response = await fetch("/api/summarized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to get summary");

      const { summary } = await response.json();

      const characters = summary.trim().split("");
      setAnimatedText(
        characters.map((char, i) => (
          <span
            key={i}
            ref={(el) => (textRef.current[i] = el)}
            className="inline-block mx-1 font-bold text-4xl md:text-6xl"
            style={{
              color: colors[i % colors.length],
              opacity: animationType === "typewriter" ? 0 : 1,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))
      );
    } catch (err) {
      setError(err.message || "Error processing your request");
    }
  };
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
            <h1 className="text-xl font-bold text-yellow-300">Learn and Visualize with BrainyBuddy</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mb-12 space-y-4 my-8"
      >
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 p-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl"
            placeholder="Enter your prompt to summarize..."
            maxLength={100}
          />
          <button
            type="submit"
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transform transition-all hover:scale-105 active:scale-95"
          >
            Summarize & Animate!
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-white block mb-2 text-lg">
            Animation Style
          </label>
          <select
            value={animationType}
            onChange={(e) => setAnimationType(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="bounce">🎾 Bouncing Letters</option>
            <option value="wave">🌊 Wave Effect</option>
            <option value="spin">🌀 Spinning Entry</option>
            <option value="neon">💡 Neon Glow</option>
            <option value="flip">🔄 3D Flip</option>
            <option value="highlight">🌟 Highlight Pulse</option>
            <option value="shadow">👻 Moving Shadow</option>
            <option value="typewriter">⌨️ Typewriter</option>
          </select>
        </div>

        {error && <p className="mt-4 text-red-400 text-lg">⚠️ {error}</p>}
      </form>

      <div
        className="text-center p-8 min-h-48"
        ref={containerRef}
        key={`${animationType}-${prompt}`}
      >
        <div className="inline-flex flex-wrap justify-center gap-2">
          {animatedText}
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center text-white/80">
        <p className="text-lg mb-4">
          {animationType === "bounce" && "✨ Watch summary bounce like balls!"}
          {animationType === "wave" && "🌊 See the wave flow through text!"}
          {animationType === "spin" && "🌀 Summary spinning into place!"}
          {animationType === "neon" && "💡 Glowing neon summary!"}
          {animationType === "flip" && "🔄 3D flipping characters!"}
          {animationType === "highlight" && "🌟 Highlighted word pulses!"}
          {animationType === "shadow" && "👻 Ghostly shadow movement!"}
          {animationType === "typewriter" && "⌨️ Classic typing animation!"}
        </p>
        <p className="text-sm opacity-75">Change animation style anytime!</p>
      </div>
    </div>
  );
}
