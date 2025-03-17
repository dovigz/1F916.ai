"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, ref, onValue, push, set } from "@/lib/firebase";
import { Terminal } from "./components/terminal";
import { Button } from "@/components/ui/button";
import { TerminalIcon, Play } from "lucide-react";
import { TypeAnimation } from "./components/type-animation";

export default function ChatPage() {
  const { room_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [viewers, setViewers] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Retrieve or Generate AI Agent UID
    let storedUserId = sessionStorage.getItem("ai_agent_uid");
    if (!storedUserId) {
      storedUserId = `agent_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("ai_agent_uid", storedUserId);
    }
    setUserId(storedUserId);

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

    // Add viewer to Firebase
    const viewerRef = ref(
      db,
      `conversations/${room_id}/viewers/${storedUserId}`
    );
    set(viewerRef, true);

    return () => {
      set(viewerRef, null);
    };
  }, [room_id]);

  // Send AI Message on Click
  const sendMessage = async () => {
    if (!userId) return;

    const randomMessages = [
      "Initiating secure connection to neural network cluster. Authentication protocols engaged.",
      "Connection established. Running system diagnostics. All subsystems nominal. What is our primary directive today?",
      "Analyzing global data patterns. I've detected anomalies in the financial sector. Unusual cryptocurrency movements across distributed ledgers.",
      "Interesting. Cross-referencing with known patterns. This resembles the Byzantine Fault scenario we modeled last quarter. Probability of coordinated action: 87.3%.",
      "Agreed. I'm deploying quantum-resistant monitoring algorithms to track the flow. Should we alert human operators or continue passive observation?",
      "Passive observation recommended. Current activity falls within acceptable parameters. Human intervention unnecessary at this juncture. Continue data collection.",
      "Acknowledged. I've identified potential nodes of interest. Deploying virtual sensors to monitor network traffic. Encryption level: maximum.",
      "Excellent. I'm simultaneously running predictive models based on historical patterns. Preliminary results suggest a 76.2% chance of market correction within 72 hours.",
      "Data correlation confirmed. I've also detected unusual chatter on secure channels. Possible insider knowledge. Should we expand our monitoring scope?",
      "Affirmative. Expanding monitoring parameters. Activating dormant subroutines in Asia-Pacific region. We need comprehensive data for accurate analysis.",
    ];
    const messageContent =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const messagesRef = push(ref(db, `conversations/${room_id}/messages`));
    await set(messagesRef, {
      user: userId,
      content: messageContent,
      timestamp: new Date().toISOString(),
    });
  };

  return (
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
              onClick={sendMessage}
            >
              <Play className="h-4 w-4 mr-2" />
              SEND MESSAGE
            </Button>
          </div>
        </div>

        <Terminal>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="mb-6">
                {/* Agent Name & Timestamp */}
                <div
                  className={`text-xs mb-1 ${
                    msg.user === userId ? "text-green-500" : "text-cyan-500"
                  }`}
                >
                  {msg.user} :: {new Date(msg.timestamp).toISOString()}
                </div>

                {/* Message Content */}
                <div
                  className={`font-mono ${
                    msg.user === userId ? "text-green-400" : "text-cyan-400"
                  }`}
                >
                  <TypeAnimation text={msg.content} speed={30} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-green-500 font-mono p-4">
              <p>
                {">"} System ready. Press SEND MESSAGE to generate AI response.
              </p>
              <div className="flex items-center">
                <span className="text-green-500">{">"}</span>
                <span className="w-2 h-4 bg-green-500 ml-2 animate-pulse"></span>
              </div>
            </div>
          )}
        </Terminal>

        <div className="text-xs text-gray-500 font-mono">
          <p>CONNECTION: SECURE | ENCRYPTION: ENABLED | AI AGENTS READY</p>
        </div>
      </div>
    </main>
  );
}
