import axios from 'axios';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    // Convert audio to text using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    // Get text response from GPT-4
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: transcription.text }],
      temperature: 0.7,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Convert text to speech using ElevenLabs
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VITE_ELEVENLABS_VOICE_ID}`,
      {
        text: responseText,
        model_id: process.env.VITE_ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.VITE_ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return new NextResponse(elevenLabsResponse.data, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error('Voice agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing voice request' },
      { status: 500 }
    );
  }
}