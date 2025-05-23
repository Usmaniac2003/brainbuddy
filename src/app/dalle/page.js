"use client";

import React, { useState } from "react";
import Image from "next/image";

const DallePage = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/dalle");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate image");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">DALL·E Image Generator</h1>

      <button
        onClick={handleGenerate}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {imageUrl && (
        <div className="mt-6 relative w-[512px] h-[512px]">
          <Image
            src={imageUrl}
            alt="Generated by DALL·E"
            layout="fill"
            objectFit="contain"
            className="rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default DallePage;
