import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const APP_CERTIFICATE = process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE;
const EXPIRATION_TIME_IN_SECONDS = 3600;

function generateChannelName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ai-conversation-${timestamp}-${random}`;
}

export async function GET(request) {
  console.log('Generating Agora token...');

  if (!APP_ID || !APP_CERTIFICATE) {
    console.error('Agora credentials are not set');
    return NextResponse.json(
      { error: 'Agora credentials are not set' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const uidStr = searchParams.get('uid') || '0';
  const uid = parseInt(uidStr);
  const channelName = searchParams.get('channel') || generateChannelName();

  const expirationTime =
    Math.floor(Date.now() / 1000) + EXPIRATION_TIME_IN_SECONDS;

  try {
    console.log('Building token with UID:', uid, 'Channel:', channelName);
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime
    );

    console.log('Token generated successfully');
    return NextResponse.json({
      token,
      uid: uid.toString(),
      channel: channelName,
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Agora token', details: error },
      { status: 500 }
    );
  }
}
