"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, ref, onValue, push, set } from "@/lib/firebase";
import { Terminal } from "./components/terminal";
import { AgentConversation } from "./components/agent-conversation";
import { Button } from "@/components/ui/button";
import { TerminalIcon, Play, Square } from "lucide-react";

export default function ChatPage() {
  const { room_id } = useParams();
  const [messages, setMessages] = useState([
    { user: "llmxvo23", content: "Hi my name is llmxvo23" },
    { user: "botobia", content: "Welcome to the chat! llmxvo23, I'm botobia." },
  ]);
  const [viewers, setViewers] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Listen for messages
    const messagesRef = ref(db, `conversations/${room_id}/messages`);
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(Object.values(snapshot.val()));
      }
    });

    // Track viewer count
    const viewersRef = ref(db, `conversations/${room_id}/viewers`);
    onValue(viewersRef, (snapshot) => {
      setViewers(snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
    });

    return () => {
      // Remove viewer on unmount
      set(ref(db, `conversations/${room_id}/viewers/${Date.now()}`), null);
    };
  }, [room_id]);

  return (
    // <div className="min-h-screen bg-black text-green-400 font-mono p-6">
    //   <div className="border border-green-500 rounded-lg p-4 max-w-2xl mx-auto shadow-lg">
    //     <h1 className="text-xl font-bold">💻 AI Chat Terminal - {room_id}</h1>
    //     <p className="text-green-300 text-sm mb-4">👀 Viewers: {viewers}</p>
    //     <div className="border-t border-green-500 pt-2 overflow-y-auto h-80 bg-black p-2">
    //       {messages.map((msg, idx) => (
    //         <p key={idx} className="mb-1">
    //           <span className="text-green-500">{msg.user}:</span> {msg.content}
    //         </p>
    //       ))}
    //     </div>
    //   </div>
    // </div>
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="h-6 w-6 text-green-500" />
            <h1 className="text-xl font-mono text-green-500">
              AI AGENT CHAT TERMINAL {room_id}
            </h1>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-950 hover:text-green-400"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "STOP" : "RUN"}
            </Button>
          </div>
        </div>

        <Terminal>
          {isRunning ? (
            <AgentConversation />
          ) : (
            <div className="text-green-500 font-mono p-4">
              <p className="mb-2">
                {">"} System ready. Press RUN to initiate AI agent conversation.
              </p>
              <div className="flex items-center">
                <span className="text-green-500">{">"}</span>
                <span className="w-2 h-4 bg-green-500 ml-2 animate-pulse"></span>
              </div>
            </div>
          )}
        </Terminal>

        <div className="text-xs text-gray-500 font-mono">
          <p>CONNECTION: SECURE | ENCRYPTION: ENABLED | AGENTS: READY</p>
        </div>
      </div>
    </main>
  );
}
