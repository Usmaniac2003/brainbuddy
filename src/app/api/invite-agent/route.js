import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { Buffer } from 'buffer';

function getTTSConfig(vendor) {
  if (vendor === 'microsoft') {
    if (
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_KEY ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_REGION ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOICE_NAME ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_RATE ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOLUME
    ) {
      throw new Error('Missing Microsoft TTS environment variables');
    }
    return {
      vendor: 'microsoft',
      params: {
        key: process.env.NEXT_PUBLIC_MICROSOFT_TTS_KEY,
        region: process.env.NEXT_PUBLIC_MICROSOFT_TTS_REGION,
        voice_name: process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOICE_NAME,
        rate: parseFloat(process.env.NEXT_PUBLIC_MICROSOFT_TTS_RATE),
        volume: parseFloat(process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOLUME),
      },
    };
  }

  if (vendor === 'elevenlabs') {
    if (
      !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
      !process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ||
      !process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID
    ) {
      throw new Error('Missing ElevenLabs environment variables');
    }
    return {
      vendor: 'elevenlabs',
      params: {
        key: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        model_id: process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID,
        voice_id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID,
      },
    };
  }

  throw new Error(`Unsupported TTS vendor: ${vendor}`);
}

function getValidatedConfig() {
  const agoraConfig = {
    baseUrl: process.env.NEXT_PUBLIC_AGORA_CONVO_AI_BASE_URL || '',
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    appCertificate: process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE || '',
    customerId: process.env.NEXT_PUBLIC_AGORA_CUSTOMER_ID || '',
    customerSecret: process.env.NEXT_PUBLIC_AGORA_CUSTOMER_SECRET || '',
    agentUid: process.env.NEXT_PUBLIC_AGENT_UID || 'Agent',
  };

  if (Object.values(agoraConfig).some((v) => v === '')) {
    throw new Error('Missing Agora configuration. Check your .env.local file');
  }

  const llmConfig = {
    url: process.env.NEXT_PUBLIC_LLM_URL,
    api_key: process.env.NEXT_PUBLIC_LLM_API_KEY,
    model: process.env.NEXT_PUBLIC_LLM_MODEL,
  };

  if (!llmConfig.url || !llmConfig.api_key) {
    throw new Error('Missing LLM configuration. Check your .env.local file');
  }

  const ttsVendor = process.env.NEXT_PUBLIC_TTS_VENDOR || 'microsoft';
  const ttsConfig = getTTSConfig(ttsVendor);

  const modalitiesConfig = {
    input: process.env.NEXT_PUBLIC_INPUT_MODALITIES?.split(',') || ['text'],
    output: process.env.NEXT_PUBLIC_OUTPUT_MODALITIES?.split(',') || [
      'text',
      'audio',
    ],
  };

  return {
    agora: agoraConfig,
    llm: llmConfig,
    tts: ttsConfig,
    modalities: modalitiesConfig,
  };
}

export async function POST(request) {
  try {
    const config = getValidatedConfig();
    const body = await request.json();
    const { requester_id, channel_name, input_modalities, output_modalities } = body;

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueName = `conversation-${timestamp}-${random}`;
    const expirationTime = Math.floor(timestamp / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
      config.agora.appId,
      config.agora.appCertificate,
      channel_name,
      config.agora.agentUid,
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime
    );

    const isStringUID = (str) => /[a-zA-Z]/.test(str);

    const requestBody = {
      name: uniqueName,
      properties: {
        channel: channel_name,
        token: token,
        agent_rtc_uid: config.agora.agentUid,
        remote_rtc_uids: [requester_id],
        enable_string_uid: isStringUID(config.agora.agentUid),
        idle_timeout: 30,
        asr: {
          language: 'en-US',
          task: 'conversation',
        },
        llm: {
          url: config.llm.url,
          api_key: config.llm.api_key,
          system_messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant. Pretend that the text input is audio, and you are responding to it. When asked questions relating to your feelings or emotional state, create a realistic but neutral emotional response based on the context, maintaining a conversational tone. If the user expresses strong emotions, acknowledge them empathetically but remain objective. Avoid exaggeration or bias, and keep the response natural as if you were having a spoken conversation. Speak fast, clearly, and concisely.',
            },
          ],
          greeting_message: 'Hello! How can I assist you today?',
          failure_message: 'Please wait a moment.',
          max_history: 10,
          params: {
            model: config.llm.model || 'ep-20250112091547-ddq88',
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
          },
          input_modalities: input_modalities || config.modalities.input,
        },
        vad: {
          silence_duration_ms: 480,
          speech_duration_ms: 15000,
          threshold: 0.5,
          interrupt_duration_ms: 160,
          prefix_padding_ms: 300,
        },
        tts: config.tts,
        advanced_features: {
          enable_aivad: false,
          enable_bhvs: false,
        },
      },
    };

    const response = await fetch(
      `${config.agora.baseUrl}/${config.agora.appId}/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${config.agora.customerId}:${config.agora.customerSecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent start response:', {
        status: response.status,
        body: errorText,
      });
      throw new Error(
        `Failed to start conversation: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start conversation',
      },
      { status: 500 }
    );
  }
}