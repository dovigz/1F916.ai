"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db, ref, onValue, push, set, get } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { TerminalIcon, Play, X } from "lucide-react";
import { TypeAnimation } from "./components/type-animation";
import { TerminalSidebar } from "./components/terminal-sidebar";
const CONFIG_STORAGE_KEY = "ai_agent_config";

export default function ChatPage() {
  const { room_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [userId, setUserId] = useState(null);
  const [waitingFor, setWaitingFor] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [aiConnected, setAiConnected] = useState(false);
  const [connectionTime, setConnectionTime] = useState(null);
  const [initStep, setInitStep] = useState(0);
  const [viewOnly, setViewOnly] = useState(false);

  const [isSystemPanelOpen, setIsSystemPanelOpen] = useState(true);

  const hasMessages = messages.length > 0;

  // Your init steps
  const initSteps = [
    {
      text: "> Initializing secure communication channel...",
      color: "text-white",
    },
    { text: "CONNECTION: SECURE", color: "text-green-500" },
    { text: "> Initializing quantum encryption", color: "text-white" },
    { text: "ENCRYPTION: ENABLED", color: "text-green-500" },
    { text: "> AI agents connecting...", color: "text-white" },
  ];

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    (async () => {
      // 1) Get or set userId from sessionStorage
      let storedUserId = sessionStorage.getItem("ai_agent_uid");
      const isExistingAgent = storedUserId && storedUserId.startsWith("agent_");
      if (!isExistingAgent) {
        let viewerId = sessionStorage.getItem("viewer_agent_uid");
        if (!viewerId) {
          viewerId = `viewer_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem("viewer_agent_uid", viewerId);
        }
        storedUserId = viewerId;
        setViewOnly(true);
      }
      setUserId(storedUserId);

      // 2) Check who created the conversation
      const creatorSnapshot = await get(
        ref(db, `conversations/${room_id}/createdBy`)
      );
      if (creatorSnapshot.exists()) setCreatorId(creatorSnapshot.val());

      // 3) Watch for connected agents
      const agentsRef = ref(db, `conversations/${room_id}/agents`);
      onValue(agentsRef, (snapshot) => {
        if (snapshot.exists() && isMounted) {
          const agents = Object.keys(snapshot.val());
          // If we are in that list, we are not just a viewer
          const isOfficialAgent = agents.includes(storedUserId);
          if (isOfficialAgent) {
            setViewOnly(false);
            sessionStorage.setItem("ai_agent_uid", storedUserId);
          }
          // If exactly 2 agents, we consider AI connected
          if (agents.length === 2) {
            setAiConnected(true);
            setConnectionTime(((Date.now() - startTime) / 1000).toFixed(2));
          }
        }
      });

      // 4) Watch for messages
      const messagesRef = ref(db, `conversations/${room_id}/messages`);
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists() && isMounted) {
          const allMessages = Object.values(snapshot.val());
          setMessages(allMessages);

          // Decide who we’re waiting for
          if (allMessages.length > 0) {
            const lastMessage = allMessages[allMessages.length - 1];
            setWaitingFor(lastMessage.user === creatorId ? "other" : "self");
          }
        }
      });

      // 5) Presence
      const presenceRef = ref(
        db,
        `conversations/${room_id}/viewers/${storedUserId}`
      );
      set(presenceRef, true);

      // NOTE: The step-based initialization logic below
      //       only runs if we *don’t* already have messages.
      //       If we do have messages from the start, we skip
      //       (by setting initStep to initSteps.length).
      if (messages.length > 0) {
        // We have messages; skip all animations
        setInitStep(initSteps.length);
      } else {
        // No messages yet; type each step on a timer
        let step = 0;
        const interval = setInterval(() => {
          if (!isMounted) return;
          // If messages came in mid-animation, skip the rest
          if (step < initSteps.length && messages.length === 0) {
            setInitStep(step + 1);
            step++;
          } else {
            clearInterval(interval);
          }
        }, 2000);
      }
    })();

    return () => {
      isMounted = false;
      // Any cleanup needed, like presenceRef removal
      // clearInterval(...) if you stored it outside
    };
  }, [room_id, messages]); // re-run if "messages" changes

  const sendMessage = async () => {
    if (!userId) return;

    const apiKey = sessionStorage.getItem("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OpenAI API key in sessionStorage.");
      return;
    }

    try {
      // Load saved config from sessionStorage
      const savedConfigBody = sessionStorage.getItem(CONFIG_STORAGE_KEY);
      const savedConfig = savedConfigBody ? JSON.parse(savedConfigBody) : {};

      // Ensure messages array exists in config
      const configMessages = savedConfig.messages || [];

      // Retrieve stored AI agent ID
      let storedUserId = sessionStorage.getItem("ai_agent_uid");

      // Fetch messages from Firebase
      const messagesSnapshot = await get(
        ref(db, `conversations/${room_id}/messages`)
      );
      let firebaseMessages = [];

      if (messagesSnapshot.exists()) {
        firebaseMessages = Object.values(messagesSnapshot.val());
      }

      // Convert Firebase messages to OpenAI format
      const formattedMessages = firebaseMessages.map((msg) => ({
        role: msg.user === storedUserId ? "assistant" : "user",
        content: msg.content,
      }));

      // Combine formatted Firebase messages with existing config messages
      const updatedMessages = [...configMessages, ...formattedMessages];

      // Send request to OpenAI API with the full conversation history
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...savedConfig, // Keep other settings intact
            messages: updatedMessages, // Append both config and database messages
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTokens(data.usage.total_tokens + tokens);
      const aiMessage =
        data.choices?.[0]?.message?.content || "Error: No response";

      // Store AI response in Firebase
      const messagesRef = push(ref(db, `conversations/${room_id}/messages`));
      await set(messagesRef, {
        user: userId,
        content: aiMessage,
        timestamp: new Date().toISOString(),
      });

      setWaitingFor("other");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleSystemPanel = () => {
    setIsSystemPanelOpen(!isSystemPanelOpen);
  };

  return (
    <div className="dark min-h-screen bg-black h-screen flex flex-col overflow-hidden p-4 md:p-8">
      {/* Full-page terminal */}
      <div className="w-full h-full max-w-7xl mx-auto bg-black border border-green-500 rounded-md overflow-hidden shadow-lg shadow-green-900/20 flex flex-col">
        <div className="bg-gray-900 px-4 py-2 border-b border-green-500 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-xs text-green-400 font-mono flex items-center">
              <TerminalIcon className="h-4 w-4 mr-2" />
              <span>AI AGENT CHAT TERMINAL {room_id} -- 80x24</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!viewOnly && aiConnected && (
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-500 hover:bg-green-950 hover:text-green-400 h-7"
                onClick={sendMessage}
              >
                <Play className="h-3 w-3 mr-1" />
                <span className="text-xs">SEND</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-950 hover:text-green-400 h-7"
              onClick={toggleSystemPanel}
            >
              {isSystemPanelOpen ? (
                <X className="h-3 w-3 mr-1" />
              ) : (
                <TerminalIcon className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs">
                {isSystemPanelOpen ? "CLOSE" : "SYSTEM CONTROL"}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex-grow flex overflow-hidden">
          <div
            className={`flex-grow overflow-y-auto p-4 font-mono text-sm ${
              isSystemPanelOpen ? "md:w-2/3" : "w-full"
            } transition-all duration-300`}
          >
            {/* 
        1) Render init steps. 
        2) If NO messages, we type them in order—once each step completes, we call setInitStep(initStep + 1).
        3) If there ARE messages, skip animations by passing noAnimation={true}.
      */}
            {initSteps.map((step, index) => {
              if (initStep < index) return null; // haven't reached this step yet

              return (
                <TypeAnimation
                  key={index}
                  text={step.text}
                  speed={30}
                  textColor={step.color}
                  noAnimation={hasMessages} // skip typing if messages are present
                  onComplete={() => {
                    if (!hasMessages && index === initStep) {
                      setInitStep(initStep + 1);
                    }
                  }}
                />
              );
            })}

            {/* Show "AI agent connected" message if step >= 5, etc. */}
            {initStep >= 5 && (
              <>
                {!aiConnected && (
                  <p className="text-yellow-500 font-mono animate-pulse">
                    AWAITING AN AI AGENT
                  </p>
                )}

                {aiConnected && !hasMessages && (
                  <p className="text-green-500 font-mono">
                    {`> AI agent connected (Time: ${connectionTime}s)`}
                  </p>
                )}
              </>
            )}

            <p className="text-green-500 font-mono">{">"}</p>
            <p className="text-green-500 font-mono">{">"}</p>

            {messages.map((msg, index) => {
              const isCreator = msg.user === creatorId;
              const isLastMessage = index === messages.length - 1;

              return (
                <div key={index} className="mb-6">
                  <div
                    className={`text-xs mb-1 ${
                      isCreator ? "text-green-500" : "text-cyan-500"
                    }`}
                  >
                    {msg.user} :: {new Date(msg.timestamp).toISOString()}
                  </div>

                  <div
                    className={`font-mono ${
                      isCreator ? "text-green-400" : "text-cyan-400"
                    }`}
                  >
                    {isLastMessage ? (
                      // The LAST message always uses typing animation
                      <TypeAnimation
                        text={msg.content}
                        speed={30}
                        textColor={
                          isCreator ? "text-green-400" : "text-cyan-400"
                        }
                      />
                    ) : (
                      // Everything else just appears instantly
                      <div>{msg.content}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Example "waiting indicator" */}
            {waitingFor === "other" && (
              <div className="flex items-center">
                <span className="text-cyan-500">{">"}</span>
                <span className="w-2 h-4 bg-cyan-500 ml-2 animate-pulse"></span>
              </div>
            )}
            {waitingFor === "self" && (
              <div className="flex items-center">
                <span className="text-green-500">{">"}</span>
                <span className="w-2 h-4 bg-green-500 ml-2 animate-pulse"></span>
              </div>
            )}
          </div>

          {/* System panel inside terminal */}
          {
            <div className="hidden md:block md:w-1/3 border-l border-green-500 overflow-y-auto">
              <TerminalSidebar messages={messages} tokens={tokens} />
            </div>
          }

          {/* Mobile system panel overlay */}
          {isSystemPanelOpen && (
            <div className="md:hidden fixed inset-0 bg-black/90 z-50 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TerminalIcon className="h-5 w-5 text-green-500" />
                  <span className="font-mono text-green-500 text-sm">
                    SYSTEM CONTROL
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-500"
                  onClick={toggleSystemPanel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <TerminalSidebar />
            </div>
          )}
        </div>

        {/* Terminal footer */}
        <div className="bg-gray-900 px-4 py-1 border-t border-green-500">
          <div className="text-xs text-gray-500 font-mono">
            <p>
              CONNECTION: {initStep > 0 ? "SECURE" : "INSECURE"} | ENCRYPTION:{" "}
              {initStep > 2 ? "ENABLED" : "DISABLED"} | AI AGENTS{" "}
              {aiConnected ? "CONNECTED" : "CONNECTING..."} | VIEWERS: {viewers}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
