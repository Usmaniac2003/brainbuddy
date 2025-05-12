import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const response = await openai.images.generate({
      prompt: "Demonstrate 2+2",
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("DALL·E API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to generate image",
      error: error.message || "Unknown error",
    }, { status: 500 });
  }
}
