import React, { useState } from 'react';
import { MessageSquare, Send, User, Bot, Sparkles, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiService } from '@/services/geminiService';
import { generateId } from '@/lib/utils';

interface InboxProps {
  messages: any[];
  onSimulateReply: (message: any) => void;
}

export default function Inbox({ messages, onSimulateReply }: InboxProps) {
  const [simulatingText, setSimulatingText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeContact, setActiveContact] = useState<string | null>(messages[0]?.from || null);

  const handleSimulateIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatingText.trim()) return;

    setIsProcessing(true);
    const fromNumber = '+2348012345678'; // Simulated contact
    
    // 1. Add the incoming message
    const incomingMsg = {
      id: generateId(),
      from: fromNumber,
      body: simulatingText,
      type: 'incoming',
      timestamp: Date.now()
    };
    onSimulateReply(incomingMsg);
    setSimulatingText('');
    setActiveContact(fromNumber);

    // 2. Generate autonomous AI response
    try {
      const aiReply = await geminiService.generateAutonomousResponse(simulatingText, "General organization outreach");
      
      // Small delay to feel natural
      setTimeout(() => {
        const outgoingMsg = {
          id: generateId(),
          from: 'ReachOut AI',
          body: aiReply,
          type: 'outgoing',
          timestamp: Date.now(),
          isAI: true
        };
        onSimulateReply(outgoingMsg);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const contactMessages = messages.filter(m => m.from === activeContact || (m.type === 'outgoing' && activeContact));

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar - Contacts */}
      <div className="w-80 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm bg-gray-50/50 dark:bg-slate-800 rounded-2xl m-2 border border-dashed border-gray-200 dark:border-gray-700/50">
              No messages yet.
            </div>
          ) : (
            Array.from(new Set(messages.map(m => m.from))).map(contact => (
              <button
                key={contact}
                onClick={() => setActiveContact(contact)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl transition-all",
                  activeContact === contact ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="font-bold text-sm truncate">{contact}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {messages.find(m => m.from === contact)?.body}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden transition-colors">
        {activeContact ? (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {activeContact.substring(activeContact.length - 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{activeContact}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Manual Mode</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-950/20 custom-scrollbar">
              {contactMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.type === 'incoming' ? "items-start" : "items-end ml-auto"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm shadow-sm",
                    msg.type === 'incoming' 
                      ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none" 
                      : "bg-blue-600 text-white rounded-tr-none"
                  )}>
                    {msg.isAI && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-black uppercase tracking-widest opacity-80">
                        <Bot className="w-3 h-3" />
                        <span>Autonomous AI Reply</span>
                      </div>
                    )}
                    {msg.body}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 italic text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSimulateIncoming} className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Simulate an incoming message from a contact..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                    value={simulatingText}
                    onChange={(e) => setSimulatingText(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                    Simulate
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!simulatingText.trim() || isProcessing}
                  className="px-6 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center italic">
                This simulator helps you test how the AI will autonomously respond to your contacts.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl m-4 shadow-inner dark:bg-slate-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Autonomous Inbox</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              When contacts reply to your campaigns, the AI will autonomously respond here. 
              Use the simulator below to test it out!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
