"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Cpu,
  Database,
  Network,
  TerminalIcon,
  X,
  Menu,
  MessageSquare,
  Hash,
  DollarSign,
  Pause,
  Skull,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function TerminalSidebar() {
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    security: "MAXIMUM",
    uptime: 0,
    startTime: Date.now(),
  });

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

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-5 w-5 text-green-500" />
          <span className="font-mono text-green-500 text-sm">
            SYSTEM CONTROL
          </span>
        </div>
      </div>

      <div className="text-green-500 px-4 py-2">SYSTEM STATUS</div>
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

      <div className="text-cyan-400 hover:text-cyan-300">
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

      <div className="text-xs text-green-500 font-mono">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span>SYSTEM ACTIVE</span>
        </div>
        <div className="mt-1">UPTIME: {formatUptime(systemStatus.uptime)}</div>
      </div>
    </>
  );
}
