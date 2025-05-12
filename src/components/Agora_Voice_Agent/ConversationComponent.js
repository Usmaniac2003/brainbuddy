'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useClientEvent,
  useIsConnected,
  useJoin,
  usePublish,
  RemoteUser,
} from 'agora-rtc-react';
import { MicrophoneButton } from './MicrophoneButton';
import { AudioVisualizer } from './AudioVisualizer';
import ConvoTextStream from './ConvoTextStream';
import { MessageEngine, EMessageStatus, EMessageEngineMode } from '@/lib/message';

// Re-export for other components
export { EMessageStatus } from '@/lib/message';

const MESSAGE_BUFFER = {};

export default function ConversationComponent({ agoraData, onTokenWillExpire, onEndConversation }) {
  const client = useRTCClient();
  const isConnected = useIsConnected();
  const remoteUsers = useRemoteUsers();
  const [isEnabled, setIsEnabled] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isEnabled);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const agentUID = process.env.NEXT_PUBLIC_AGENT_UID;
  const [joinedUID, setJoinedUID] = useState(0);
  const [messageList, setMessageList] = useState([]);
  const [currentInProgressMessage, setCurrentInProgressMessage] = useState(null);
  const messageEngineRef = useRef(null);

  // Warn if agent UID missing
  useEffect(() => {
    if (!agentUID) {
      console.warn('NEXT_PUBLIC_AGENT_UID environment variable is not set');
    } else {
      console.log('Agent UID is set to:', agentUID);
    }
  }, [agentUID]);

  // Join the Agora channel
  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID,
      channel: agoraData.channel,
      token: agoraData.token,
      uid: parseInt(agoraData.uid, 10),
    },
    true
  );

  // Initialize and clean up MessageEngine
  useEffect(() => {
    if (!client || !isConnected) return;

    // teardown old instance if present
    if (messageEngineRef.current) {
      console.log('Cleaning up existing MessageEngine instance');
      try {
        messageEngineRef.current.teardownInterval();
        messageEngineRef.current.cleanup();
      } catch (err) {
        console.error('Error cleaning up MessageEngine:', err);
      }
      messageEngineRef.current = null;
    }

    // create new instance
    console.log('Creating new MessageEngine instance with connected client');
    try {
      const engine = new MessageEngine(
        client,
        EMessageEngineMode.TEXT,
        (updatedMessages) => {
          console.log('MessageEngine update:', updatedMessages);
          const sorted = [...updatedMessages].sort((a, b) => a.turn_id - b.turn_id);
          const inProgress = sorted.find(m => m.status === EMessageStatus.IN_PROGRESS);
          if (sorted.length) {
            console.log('Message UIDs:', sorted.map(m => m.uid));
            console.log('Agent UID (for comparison):', agentUID);
          }
          setMessageList(sorted.filter(m => m.status !== EMessageStatus.IN_PROGRESS));
          setCurrentInProgressMessage(inProgress || null);
        }
      );
      messageEngineRef.current = engine;
      console.log('Starting MessageEngine...');
      engine.run({ legacyMode: false });
      console.log('MessageEngine successfully initialized and running');
    } catch (error) {
      console.error('Failed to initialize MessageEngine:', error);
    }

    return () => {
      if (messageEngineRef.current) {
        console.log('Cleaning up MessageEngine on state change');
        try {
          messageEngineRef.current.teardownInterval();
          messageEngineRef.current.cleanup();
        } catch (err) {
          console.error('Error cleaning up MessageEngine:', err);
        }
        messageEngineRef.current = null;
      }
    };
  }, [client, agentUID, isConnected]);

  // Handle raw stream messages
  useClientEvent(client, 'stream-message', (uid, payload) => {
    const uidStr = uid.toString();
    const isAgentMsg = uidStr === '333';
    console.log(
      `Received stream message from UID: ${uidStr}`,
      isAgentMsg ? 'AGENT MESSAGE' : '',
      `(Expected agent UID: ${agentUID})`,
      `Payload size: ${payload.length}`
    );
    if (messageEngineRef.current) {
      let needsRestart = false;
      const origError = console.error;
      console.error = (...args) => {
        const msg = args.join(' ');
        if (msg.includes('Message service is not running')) {
          needsRestart = true;
        }
        origError.apply(console, args);
      };
      try {
        if (isAgentMsg) {
          messageEngineRef.current.handleStreamMessage(payload);
          console.log('Processed agent message through MessageEngine');
        }
      } catch (e) {
        console.error('Error processing stream message:', e);
        needsRestart = true;
      }
      console.error = origError;
      if (needsRestart) {
        setTimeout(() => {
          console.log('Attempting to restart MessageEngine...');
          try {
            messageEngineRef.current.run({ legacyMode: false });
            console.log('MessageEngine restarted successfully');
          } catch (e) {
            console.error('Failed to restart MessageEngine:', e);
          }
        }, 50);
      }
    } else {
      console.error('MessageEngine not initialized!');
    }
    if (isAgentMsg && uidStr !== agentUID) {
      console.warn(`Possible agent UID mismatch. Message from: ${uidStr}, Expected: ${agentUID}`);
      console.info(`You may need to set NEXT_PUBLIC_AGENT_UID=${uidStr} in your .env file`);
    }
  });

  // Capture actual UID after join
  useEffect(() => {
    if (joinSuccess && client) {
      const uid = client.uid;
      setJoinedUID(uid);
      console.log('Join successful, using UID:', uid);
    }
  }, [joinSuccess, client]);

  // Publish mic track
  usePublish([localMicrophoneTrack]);

  // Always enable the local mic track
  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(true);
    }
  }, [localMicrophoneTrack]);

  // Remote user join/leave events
  useClientEvent(client, 'user-joined', (user) => {
    console.log('Remote user joined:', user.uid);
    if (user.uid.toString() === agentUID) {
      setIsAgentConnected(true);
      setIsConnecting(false);
    }
  });
  useClientEvent(client, 'user-left', (user) => {
    console.log('Remote user left:', user.uid);
    if (user.uid.toString() === agentUID) {
      setIsAgentConnected(false);
      setIsConnecting(false);
    }
  });

  // Sync agent state from remoteUsers array
  useEffect(() => {
    const present = remoteUsers.some(u => u.uid.toString() === agentUID);
    setIsAgentConnected(present);
  }, [remoteUsers, agentUID]);

  // Connection state changes
  useClientEvent(client, 'connection-state-change', (cur, prev) => {
    console.log(`Connection state changed from ${prev} to ${cur}`);
    if (cur === 'DISCONNECTED') console.log('Attempting to reconnect...');
  });

  // Leave on unmount
  useEffect(() => () => client?.leave(), [client]);

  // Stop conversation
  const handleStopConversation = async () => {
    try {
      const stopRequest = { agent_id: agoraData.agentId };
      const res = await fetch('/api/stop-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stopRequest),
      });
      if (!res.ok) throw new Error(res.statusText);
      setIsAgentConnected(false);
      onEndConversation?.();
    } catch (e) {
      console.error('Error stopping conversation:', e);
    }
  };

  // Start conversation
  const handleStartConversation = async () => {
    if (!agoraData.agentId) return;
    setIsConnecting(true);
    try {
      const startRequest = {
        requester_id: joinedUID.toString(),
        channel_name: agoraData.channel,
        input_modalities: ['text'],
        output_modalities: ['text', 'audio'],
      };
      const res = await fetch('/api/invite-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startRequest),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data.agent_id) agoraData.agentId = data.agent_id;
    } catch (e) {
      console.warn('Error starting conversation:', e.message || e);
      setIsConnecting(false);
    }
  };

  // Token renewal handler
  const handleTokenWillExpire = useCallback(async () => {
    if (!onTokenWillExpire || !joinedUID) return;
    try {
      const newToken = await onTokenWillExpire(joinedUID.toString());
      await client?.renewToken(newToken);
      console.log('Successfully renewed Agora token');
    } catch (e) {
      console.error('Failed to renew Agora token:', e);
    }
  }, [client, onTokenWillExpire, joinedUID]);

  useClientEvent(client, 'token-privilege-will-expire', handleTokenWillExpire);

  // Debug remoteUsers array
  useEffect(() => {
    if (remoteUsers.length) {
      console.log('Remote users detected:', remoteUsers.map(u => u.uid));
      console.log('Current NEXT_PUBLIC_AGENT_UID:', agentUID);
      const potential = remoteUsers.map(u => u.uid.toString());
      if (agentUID && !potential.includes(agentUID)) {
        console.warn('Agent UID mismatch! Expected:', agentUID, 'Available:', potential);
        console.info(`Consider updating NEXT_PUBLIC_AGENT_UID to one of: ${potential.join(', ')}`);
      }
    }
  }, [remoteUsers, agentUID]);

  return (
    <div className="flex flex-col gap-6 p-4 h-full">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isAgentConnected ? (
          <button
            onClick={handleStopConversation}
            disabled={isConnecting}
            className="px-4 py-2 bg-red-500/80 text-white rounded-full border border-red-400/30 backdrop-blur-sm hover:bg-red-600/90 transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isConnecting ? 'Disconnecting...' : 'Stop Agent'}
          </button>
        ) : (
          !remoteUsers.length && (
            <button
              onClick={handleStartConversation}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-500/80 text-white rounded-full border border-blue-400/30 backdrop-blur-sm hover:bg-blue-600/90 transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isConnecting ? 'Connecting with agent...' : 'Connect Agent'}
            </button>
          )
        )}
        <div
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          onClick={onEndConversation}
          role="button"
          title="End conversation"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Remote users’s audio & video */}
      <div className="flex-1">
        {remoteUsers.map(user => (
          <div key={user.uid}>
            <AudioVisualizer track={user.audioTrack} />
            <RemoteUser user={user} />
          </div>
        ))}
        {!remoteUsers.length && (
          <div className="text-center text-gray-500 py-8">
            Waiting for AI agent to join...
          </div>
        )}
      </div>

      {/* Mic control fixed bottom center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <MicrophoneButton
          isEnabled={isEnabled}
          setIsEnabled={setIsEnabled}
          localMicrophoneTrack={localMicrophoneTrack}
        />
      </div>

      {/* Chat transcript */}
      <ConvoTextStream
        messageList={messageList}
        currentInProgressMessage={currentInProgressMessage}
        agentUID={agentUID}
      />
    </div>
  );
}
