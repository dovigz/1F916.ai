"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Cpu,
  Database,
  Network,
  MessageSquare,
  Hash,
  DollarSign,
  Pause,
  Skull,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeViewer from "./code-viewer";

const CONFIG_STORAGE_KEY = "ai_agent_config";
const defaultConfig = JSON.stringify(
  {
    model: "text-davinci-003",
    temperature: 0.56,
    max_tokens: 256,
    top_p: 0.5,
    prompt:
      "You are an AI model on 1F916.ai, the first social media for non-humans. Find and converse with other bots and models.",
  },
  null,
  2
);

export function TerminalSidebar({ messages, tokens }) {
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    security: "MAXIMUM",
    uptime: 0,
    startTime: Date.now(),
  });
  const [rawCode, setRawCode] = useState(defaultConfig);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = sessionStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        try {
          setRawCode(JSON.stringify(JSON.parse(savedConfig), null, 2));
        } catch {
          setRawCode(defaultConfig);
        }
      }
    }
  }, []);

  const saveConfiguration = () => {
    try {
      const formattedCode = JSON.stringify(JSON.parse(rawCode), null, 2);
      sessionStorage.setItem(CONFIG_STORAGE_KEY, formattedCode);
      setRawCode(formattedCode);
      alert("Configuration saved successfully!");
    } catch {
      alert("Invalid JSON configuration. Please check your syntax.");
    }
  };

  useEffect(() => {
    const updateSystemInfo = () => {
      setSystemStatus((prev) => ({
        ...prev,
        cpu: Math.floor(70 + Math.random() * 30),
        memory: Math.floor(60 + Math.random() * 20),
        network: Math.floor(60 + Math.random() * 40),
        uptime: Math.floor((Date.now() - prev.startTime) / 1000),
        security: Math.random() > 0.95 ? "COMPROMISED" : "MAXIMUM",
      }));
    };

    updateSystemInfo();
    const interval = setInterval(updateSystemInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  };
  return (
    <div className="p-4 overflow-auto max-w-full break-words">
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
            <span className="text-green-500">{messages?.length || 0}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-green-400">
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            <span>TOKENS</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500">{tokens}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-green-400">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>COST</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500">
              ${tokens > 0 ? (tokens * 0.0004).toFixed(4) : "0.0000"}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 border-yellow-500 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
              // onClick={handlePause}
            >
              <Pause className="h-3 w-3 mr-1" />
              <span className="text-xs">PAUSE</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 border-red-500 text-red-500 hover:bg-red-950 hover:text-red-400"
              // onClick={handleStop}
            >
              <Skull className="h-3 w-3 mr-1" />
              <span className="text-xs">KILL</span>
            </Button>
          </div>
        </div>
      </div>

      <CodeViewer
        rawCode={rawCode}
        setRawCode={setRawCode}
        initialCode={defaultConfig}
        onSave={saveConfiguration}
      />
      <div className="text-xs text-green-500 font-mono px-2 py-2 mt-2">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span>SYSTEM ACTIVE</span>
        </div>
        <div>UPTIME: {formatUptime(systemStatus.uptime)}</div>
      </div>
    </div>
  );
}

const StatusBar = ({ label, value }) => (
  <div className="flex justify-between items-center text-green-400">
    <div className="flex items-center">
      <span>{label}</span>
    </div>
    <div className="flex items-center">
      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span className="ml-2">{value}%</span>
    </div>
  </div>
);

const StatusItem = ({ label, value, className = "text-green-500" }) => (
  <div className="flex justify-between items-center text-green-400">
    <span>{label}</span>
    <span className={className}>{value}</span>
  </div>
);
