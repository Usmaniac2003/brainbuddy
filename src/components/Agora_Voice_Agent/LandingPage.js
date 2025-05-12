// 'use client';

// import { useState, useMemo, Suspense } from 'react';
// import dynamic from 'next/dynamic';
// import ParticleBackground from '.ParticleBackground';

// // Dynamically import the ConversationComponent with SSR disabled
// const ConversationComponent = dynamic(() => import('./ConversationComponent'), {
//   ssr: false,
// });

// // Dynamically import AgoraRTC and AgoraRTCProvider
// const AgoraProvider = dynamic(
//   async () => {
//     const { AgoraRTCProvider, default: AgoraRTC } = await import(
//       'agora-rtc-react'
//     );
//     return {
//       default: ({ children }) => {
//         const client = useMemo(
//           () => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
//           []
//         );
//         return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
//       },
//     };
//   },
//   { ssr: false }
// );

// export default function Agent() {
//   const [showConversation, setShowConversation] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [agoraData, setAgoraData] = useState(null);
//   const [agentJoinError, setAgentJoinError] = useState(false);

//   const handleStartConversation = async () => {
//     setIsLoading(true);
//     setError(null);
//     setAgentJoinError(false);

//     try {
//       // First, get the Agora token
//       console.log('Fetching Agora token…');
//       const agoraResponse = await fetch('/api/generate-agora-token');
//       const tokenData = await agoraResponse.json();
//       console.log('Agora API response:', tokenData);

//       if (!agoraResponse.ok) {
//         throw new Error(
//           `Failed to generate Agora token: ${JSON.stringify(tokenData)}`
//         );
//       }

//       // Then invite the agent
//       const startRequest = {
//         requester_id: tokenData.uid,
//         channel_name: tokenData.channel,
//         input_modalities: ['text'],
//         output_modalities: ['text', 'audio'],
//       };

//       try {
//         const agentResponse = await fetch('/api/invite-agent', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(startRequest),
//         });

//         if (!agentResponse.ok) {
//           setAgentJoinError(true);
//         } else {
//           const agentData = await agentResponse.json();
//           setAgoraData({
//             ...tokenData,
//             agentId: agentData.agent_id,
//           });
//         }
//       } catch (err) {
//         console.error('Failed to start conversation with agent:', err);
//         setAgentJoinError(true);
//       }

//       setShowConversation(true);
//     } catch (err) {
//       console.error('Error starting conversation:', err);
//       setError('Failed to start conversation. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTokenWillExpire = async (uid) => {
//     try {
//       const resp = await fetch(
//         `/api/generate-agora-token?channel=${agoraData?.channel}&uid=${uid}`
//       );
//       const data = await resp.json();
//       if (!resp.ok) throw new Error('Failed to generate new token');
//       return data.token;
//     } catch (err) {
//       console.error('Error renewing token:', err);
//       throw err;
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
//       <ParticleBackground />

//       <div className="z-10 text-center">
//         <h1 className="text-4xl font-bold mb-6">Converse</h1>
//         <p className="text-lg mb-6">
//           When was the last time you had an intelligent conversation?
//         </p>

//         {!showConversation ? (
//           <>
//             <button
//               onClick={handleStartConversation}
//               disabled={isLoading}
//               className="px-8 py-3 bg-blue-600/80 text-white rounded-full border border-blue-400/30 backdrop-blur-sm 
//                 hover:bg-blue-700/90 transition-all shadow-lg hover:shadow-blue-500/20 
//                 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
//             >
//               {isLoading ? 'Starting...' : 'Start Conversation'}
//             </button>
//             {error && <p className="mt-4 text-red-400">{error}</p>}
//           </>
//         ) : agoraData ? (
//           <>
//             {agentJoinError && (
//               <div className="mb-4 p-3 bg-red-600/20 rounded-lg text-red-400">
//                 Failed to connect with AI agent. The conversation may not work
//                 as expected.
//               </div>
//             )}
//             <Suspense fallback={<div>Loading conversation…</div>}>
//               <AgoraProvider>
//                 <ConversationComponent
//                   agoraData={agoraData}
//                   onTokenWillExpire={handleTokenWillExpire}
//                   onEndConversation={() => setShowConversation(false)}
//                 />
//               </AgoraProvider>
//             </Suspense>
//           </>
//         ) : (
//           <p>Failed to load conversation data.</p>
//         )}
//       </div>
//     </div>
//   );
// }
