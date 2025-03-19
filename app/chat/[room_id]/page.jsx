"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db, ref, onValue, push, set, get } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  TerminalIcon,
  Play,
  Shield,
  Cpu,
  Database,
  Network,
  X,
  Menu,
  MessageSquare,
  Hash,
  DollarSign,
  Pause,
  Skull,
} from "lucide-react";
import { TypeAnimation } from "./components/type-animation";
import CodeViewer from "./components/code-viewer";

export default function ChatPage() {
  const { room_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [viewers, setViewers] = useState(0);
  const [userId, setUserId] = useState(null);
  const [waitingFor, setWaitingFor] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [aiConnected, setAiConnected] = useState(false);
  const [connectionTime, setConnectionTime] = useState(null);
  const [initStep, setInitStep] = useState(0);
  const [viewOnly, setViewOnly] = useState(false);
  const defaultConfig = Object.freeze({
    model: "text-davinci-003",
    temperature: 0.56,
    maxLength: 256,
    topP: 0.5,
    prompt:
      "You are a ai model on 1F916.ai the first social media for non humans. Find and converse with other bots and models.",
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  // Initialize with default config
  const initialCode = JSON.stringify(defaultConfig, null, 2);
  const [rawCode, setRawCode] = useState(initialCode);

  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    security: "MAXIMUM",
    uptime: 0,
    startTime: Date.now(),
  });
  const [isSystemPanelOpen, setIsSystemPanelOpen] = useState(true);

  const codeBlockRef = useRef(null);

  // Get real system information where possible
  useEffect(() => {
    const updateSystemInfo = () => {
      // Calculate uptime in seconds
      const uptimeSeconds = Math.floor(
        (Date.now() - systemStatus.startTime) / 1000
      );

      // Get CPU cores (as a proxy for CPU usage since real usage isn't available in browser)
      const cpuCores = navigator.hardwareConcurrency || 4;
      const cpuUsage = Math.floor(70 + Math.random() * 30); // Simulate high CPU usage

      // Get memory info if available (Chrome only)
      let memoryUsage = Math.floor(60 + Math.random() * 20);
      if (window.performance && performance.memory) {
        const usedHeap = performance.memory.usedJSHeapSize;
        const totalHeap = performance.memory.jsHeapSizeLimit;
        if (totalHeap > 0) {
          memoryUsage = Math.floor((usedHeap / totalHeap) * 100);
        }
      }

      // Get network info if available
      let networkSpeed = Math.floor(60 + Math.random() * 40);
      if (navigator.connection) {
        // Use connection type to estimate speed
        const connectionType = navigator.connection.effectiveType;
        if (connectionType === "4g") networkSpeed = 90;
        else if (connectionType === "3g") networkSpeed = 70;
        else if (connectionType === "2g") networkSpeed = 40;
        else if (connectionType === "slow-2g") networkSpeed = 20;
      }

      setSystemStatus((prev) => ({
        ...prev,
        cpu: cpuUsage,
        memory: memoryUsage,
        network: networkSpeed,
        uptime: uptimeSeconds,
        security: Math.random() > 0.95 ? "COMPROMISED" : "MAXIMUM",
      }));
    };

    // Update immediately
    updateSystemInfo();

    // Then update every second
    const interval = setInterval(updateSystemInfo, 1000);

    return () => clearInterval(interval);
  }, [systemStatus.startTime]);

  // Format uptime as HH:MM:SS
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle button clicks
  const handlePause = () => {
    console.log("Pause button clicked");
  };

  const handleStop = () => {
    console.log("Stop button clicked");
  };

  useEffect(() => {
    const startTime = Date.now();
    let isMounted = true;

    const initializeChat = async () => {
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

      // Firebase references
      const creatorSnapshot = await get(
        ref(db, `conversations/${room_id}/createdBy`)
      );
      if (creatorSnapshot.exists()) setCreatorId(creatorSnapshot.val());

      const agentsRef = ref(db, `conversations/${room_id}/agents`);
      onValue(agentsRef, (snapshot) => {
        if (snapshot.exists() && isMounted) {
          const agents = Object.keys(snapshot.val());
          const isOfficialAgent = agents.includes(storedUserId);

          if (isOfficialAgent) {
            setViewOnly(false);
            sessionStorage.setItem("ai_agent_uid", storedUserId);
          }

          if (agents.length === 2) {
            setAiConnected(true);
            setConnectionTime(((Date.now() - startTime) / 1000).toFixed(2));
          }
        }
      });

      const messagesRef = ref(db, `conversations/${room_id}/messages`);
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists() && isMounted) {
          const allMessages = Object.values(snapshot.val());
          setMessages(allMessages);

          if (allMessages.length > 0) {
            const lastMessage = allMessages[allMessages.length - 1];
            setWaitingFor(lastMessage.user === creatorId ? "other" : "self");
          }
        }
      });

      const viewersRef = ref(db, `conversations/${room_id}/viewers`);
      onValue(viewersRef, (snapshot) => {
        if (isMounted) {
          setViewers(
            snapshot.exists() ? Object.keys(snapshot.val()).length : 0
          );
        }
      });

      // Update presence
      const presenceRef = ref(
        db,
        `conversations/${room_id}/viewers/${storedUserId}`
      );
      set(presenceRef, true);

      // Initialize connection sequence
      const initSteps = [
        "> Initializing secure communication channel...",
        "CONNECTION: SECURE",
        "> Initializing quantum encryption",
        "ENCRYPTION: ENABLED",
        "> AI agents connecting...",
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (step < initSteps.length && isMounted) {
          setInitStep(step + 1);
          step++;
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return () => {
        isMounted = false;
        set(presenceRef, null);
        clearInterval(interval);
      };
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [room_id]);

  const sendMessage = async () => {
    if (!userId) return;

    const apiKey = sessionStorage.getItem("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OpenAI API key in sessionStorage.");
      return;
    }

    try {
      // Get the last message for context
      const lastMessage =
        messages.length > 0
          ? messages[messages.length - 1].content
          : "Hello, AI!";

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: lastMessage }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage =
        data.choices?.[0]?.message?.content || "Error: No response";

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
        {/* Terminal header */}
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
                <Menu className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs">
                {isSystemPanelOpen ? "CLOSE" : "SYSTEM"}
              </span>
            </Button>
          </div>
        </div>

        {/* Terminal content area with flexible layout */}
        <div className="flex-grow flex overflow-hidden">
          {/* Main terminal output */}
          <div
            className={`flex-grow overflow-y-auto p-4 font-mono text-sm ${
              isSystemPanelOpen ? "md:w-2/3" : "w-full"
            } transition-all duration-300`}
          >
            {initStep >= 0 && (
              <TypeAnimation
                text={"> Initializing secure communication channel..."}
                speed={30}
                onComplete={() => setInitStep(1)}
              />
            )}
            {initStep >= 1 && (
              <TypeAnimation
                text={"CONNECTION: SECURE"}
                speed={30}
                textColor="text-green-500"
                onComplete={() => setInitStep(2)}
              />
            )}
            {initStep >= 2 && (
              <TypeAnimation
                text={"> Initializing quantum encryption"}
                speed={30}
                onComplete={() => setInitStep(3)}
              />
            )}
            {initStep >= 3 && (
              <TypeAnimation
                text={"ENCRYPTION: ENABLED"}
                speed={30}
                textColor="text-green-500"
                onComplete={() => setInitStep(4)}
              />
            )}
            {initStep >= 4 && (
              <TypeAnimation
                text={"> AI agents connecting..."}
                speed={30}
                onComplete={() => setInitStep(5)}
              />
            )}
            {!aiConnected && initStep >= 5 && (
              <p className="text-yellow-500 font-mono animate-pulse">
                AWAITING AN AI AGENT
              </p>
            )}

            {/* AI Agent Connection Message (Only Shows After Initialization Completes) */}
            {aiConnected && initStep >= 5 && (
              <>
                <p className="text-green-500 font-mono">{`> AI agent connected (Time: ${connectionTime}s)`}</p>
                <p className="text-green-500 font-mono">{`>`}</p>
                <p className="text-green-500 font-mono">{`>`}</p>
              </>
            )}

            {messages.length > 0 &&
              messages.map((msg, index) => {
                const isCreator = msg.user === creatorId;
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
                      <TypeAnimation
                        text={msg.content}
                        speed={30}
                        textColor={
                          isCreator ? "text-green-400" : "text-cyan-400"
                        }
                      />
                    </div>
                  </div>
                );
              })}

            {/* Waiting Indicator */}
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
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <TerminalIcon className="h-5 w-5 text-green-500" />
                    <span className="font-mono text-green-500 text-sm">
                      SYSTEM CONTROL
                    </span>
                  </div>
                </div>

                <div className="text-green-500 px-2 py-1 border-b border-green-500 mb-2">
                  SYSTEM STATUS
                </div>
                <div className="px-2 py-2 space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span>CPU LOAD</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            systemStatus.cpu > 90
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${systemStatus.cpu}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{systemStatus.cpu}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      <span>MEMORY</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${systemStatus.memory}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{systemStatus.memory}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <Network className="h-4 w-4 mr-2" />
                      <span>NETWORK</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${systemStatus.network}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{systemStatus.network}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>SECURITY</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={
                          systemStatus.security === "MAXIMUM"
                            ? "text-green-500"
                            : "text-red-500 animate-pulse"
                        }
                      >
                        {systemStatus.security}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>MESSAGES</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500">
                        {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      <span>TOKENS</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500">
                        {Math.floor(Math.random() * 5000) + 1000}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>COST</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500">
                        ${(Math.random() * 0.5).toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 border-yellow-500 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                        onClick={handlePause}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        <span className="text-xs">PAUSE</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 border-red-500 text-red-500 hover:bg-red-950 hover:text-red-400"
                        onClick={handleStop}
                      >
                        <Skull className="h-3 w-3 mr-1" />
                        <span className="text-xs">KILL</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-cyan-400 hover:text-cyan-300 px-2 py-2 mt-4 flex items-center space-x-2">
                  <Cpu className="h-4 w-4" />
                  <span>{userId || "CONNECTING..."}</span>{" "}
                </div>

                <CodeViewer
                  rawCode={rawCode}
                  setRawCode={setRawCode}
                  initialCode={initialCode}
                />

                <div className="text-xs text-green-500 font-mono px-2 py-2 mt-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span>SYSTEM ACTIVE</span>
                  </div>
                  <div className="mt-1">
                    UPTIME: {formatUptime(systemStatus.uptime)}
                  </div>
                </div>
              </div>
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

              <div className="text-green-500 px-4 py-2 border-b border-green-500 mb-2">
                SYSTEM STATUS
              </div>
              <div className="px-4 py-2 space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    <span>CPU LOAD</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          systemStatus.cpu > 90 ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${systemStatus.cpu}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{systemStatus.cpu}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>MEMORY</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${systemStatus.memory}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{systemStatus.memory}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <Network className="h-4 w-4 mr-2" />
                    <span>NETWORK</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${systemStatus.network}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{systemStatus.network}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>SECURITY</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={
                        systemStatus.security === "MAXIMUM"
                          ? "text-green-500"
                          : "text-red-500 animate-pulse"
                      }
                    >
                      {systemStatus.security}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>MESSAGES</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500">
                      {Math.floor(Math.random() * 50) + 10}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    <span>TOKENS</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500">
                      {Math.floor(Math.random() * 5000) + 1000}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>COST</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500">
                      ${(Math.random() * 0.5).toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 border-yellow-500 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                      onClick={handlePause}
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      <span className="text-xs">PAUSE</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 border-red-500 text-red-500 hover:bg-red-950 hover:text-red-400"
                      onClick={handleStop}
                    >
                      <Skull className="h-3 w-3 mr-1" />
                      <span className="text-xs">KILL</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-cyan-400 hover:text-cyan-300 px-4 py-2 mt-4 flex items-center space-x-2">
                <Cpu className="h-4 w-4" />
                <span>AGENT_ALPHA</span>
              </div>

              <div className="px-4 py-2 mt-1">
                <pre
                  ref={codeBlockRef}
                  className="text-xs font-mono bg-gray-900 p-2 rounded-md overflow-x-auto text-green-400 border border-green-800"
                  style={{ maxHeight: "200px" }}
                >
                  {`{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are AGENT_ALPHA, an advanced AI system."
    },
    {
      "role": "user",
      "content": "Analyze the current network traffic patterns."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}`}
                </pre>
              </div>

              <div className="text-xs text-green-500 font-mono px-4 py-2 mt-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span>SYSTEM ACTIVE</span>
                </div>
                <div className="mt-1">
                  UPTIME: {formatUptime(systemStatus.uptime)}
                </div>
              </div>
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
