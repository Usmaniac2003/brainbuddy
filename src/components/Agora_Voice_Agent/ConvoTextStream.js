// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   MessageCircle,
//   X,
//   UnfoldVertical,
//   ChevronsDownUp,
//   ArrowDownFromLine,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';

// // Replace enum with plain object
// const EMessageStatus = {
//   IN_PROGRESS: 'in_progress',
//   COMPLETED: 'completed',
//   ERROR: 'error'
// };

// export default function ConvoTextStream({
//   messageList,
//   currentInProgressMessage = null,
//   agentUID,
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
//   const scrollRef = useRef(null);
//   const lastMessageRef = useRef(null);
//   const prevMessageLengthRef = useRef(messageList.length);
//   const prevMessageTextRef = useRef('');
//   const [isChatExpanded, setIsChatExpanded] = useState(false);
//   const hasSeenFirstMessageRef = useRef(false);

//   useEffect(() => {
//     if (messageList.length > 0 || currentInProgressMessage) {
//       console.log(
//         'ConvoTextStream - Messages:',
//         messageList.map((m) => ({
//           uid: m.uid,
//           text: m.text,
//           status: m.status,
//         })),
//         'Current in progress:',
//         currentInProgressMessage,
//         'Agent UID:',
//         agentUID
//       );
//     }
//   }, [messageList, currentInProgressMessage, agentUID]);

//   const scrollToBottom = () => {
//     scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
//   };

//   const handleScroll = () => {
//     if (scrollRef.current) {
//       const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
//       setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
//     }
//   };

//   const hasContentChanged = () => {
//     if (!currentInProgressMessage) return false;
//     const currentText = currentInProgressMessage.text || '';
//     const textLengthDiff = currentText.length - prevMessageTextRef.current.length;
//     const hasSignificantChange = textLengthDiff > 20;
//     hasSignificantChange && (prevMessageTextRef.current = currentText);
//     return hasSignificantChange;
//   };

//   useEffect(() => {
//     const hasNewMessage = messageList.length > 0;
//     const hasInProgressMessage = shouldShowStreamingMessage() && currentInProgressMessage;

//     if ((hasNewMessage || hasInProgressMessage) && !hasSeenFirstMessageRef.current && !isOpen) {
//       setIsOpen(true);
//       hasSeenFirstMessageRef.current = true;
//     }
//   }, [messageList, currentInProgressMessage]);

//   useEffect(() => {
//     const hasNewMessage = messageList.length > prevMessageLengthRef.current;
//     const hasStreamingChange = hasContentChanged();

//     if ((hasNewMessage || shouldAutoScroll || hasStreamingChange) {
//       scrollToBottom();
//     }

//     prevMessageLengthRef.current = messageList.length;
//   }, [messageList, currentInProgressMessage?.text, shouldAutoScroll]);

//   useEffect(() => {
//     if (currentInProgressMessage?.status === EMessageStatus.IN_PROGRESS && shouldAutoScroll) {
//       const timer = setTimeout(scrollToBottom, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [currentInProgressMessage?.text]);

//   const shouldShowStreamingMessage = () => {
//     return currentInProgressMessage?.status === EMessageStatus.IN_PROGRESS && 
//            currentInProgressMessage?.text?.trim().length > 0;
//   };

//   const toggleChat = () => {
//     setIsOpen(!isOpen);
//     !isOpen && (hasSeenFirstMessageRef.current = true);
//   };

//   const toggleChatExpanded = () => setIsChatExpanded(!isChatExpanded);

//   const isAIMessage = (message) => {
//     return message.uid === 0 || (agentUID && message.uid.toString() === agentUID);
//   };

//   const allMessages = [...messageList];
//   if (shouldShowStreamingMessage() && currentInProgressMessage) {
//     allMessages.push(currentInProgressMessage);
//   }

//   return (
//     <div id="chatbox" className="fixed bottom-24 right-8 z-50">
//       {isOpen ? (
//         <div className={cn('bg-white rounded-lg shadow-lg w-96 flex flex-col text-black', isChatExpanded && 'expanded')}>
//           <div className="p-2 border-b flex justify-between items-center shrink-0">
//             <Button variant="ghost" size="icon" onClick={toggleChatExpanded}>
//               {isChatExpanded ? (
//                 <ArrowDownFromLine className="h-4 w-4" />
//               ) : (
//                 <UnfoldVertical className="h-4 w-4" />
//               )}
//             </Button>
//             <h3 className="font-semibold">Chat</h3>
//             <Button variant="ghost" size="icon" onClick={toggleChat}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>

//           <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={handleScroll}>
//             <div className="p-4 space-y-4">
//               {allMessages.map((message, index) => (
//                 <div
//                   key={`${message.turn_id}-${message.uid}-${message.status}`}
//                   ref={index === allMessages.length - 1 ? lastMessageRef : null}
//                   className={cn(
//                     'flex items-start gap-2 w-full',
//                     isAIMessage(message) ? 'flex-row' : 'flex-row-reverse'
//                   )}
//                 >
//                   <div className={cn(
//                     'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
//                     isAIMessage(message) ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
//                   )}>
//                     {isAIMessage(message) ? 'AI' : 'U'}
//                   </div>

//                   <div className={cn('flex', isAIMessage(message) ? 'flex-col items-start' : 'flex-col items-end')}>
//                     <div className={cn(
//                       'rounded-[15px] px-3 py-2',
//                       isAIMessage(message) ? 'bg-gray-100 text-left' : 'bg-blue-500 text-white text-right',
//                       message.status === EMessageStatus.IN_PROGRESS && 'animate-pulse'
//                     )}>
//                       {message.text}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <Button
//           onClick={toggleChat}
//           className="rounded-full w-12 h-12 flex items-center justify-center bg-white hover:invert hover:border-2 hover:border-black hover:scale-150 transition-all duration-300"
//         >
//           <MessageCircle className="h-6 w-6 text-black" />
//         </Button>
//       )}
//     </div>
//   );
// }