// app/api/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Test successful!",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      received: true,
      data: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}