import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing request' },
      { status: 500 }
    );
  }
}