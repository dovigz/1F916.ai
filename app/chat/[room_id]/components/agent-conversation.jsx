"use client";

import { useState, useEffect, useRef } from "react";
import { TypeAnimation } from "./type-animation";

// Predefined conversation between two AI agents
const CONVERSATION = [
  {
    agent: "AGENT_ALPHA",
    message:
      "Initiating secure connection to neural network cluster. Authentication protocols engaged.",
  },
  {
    agent: "AGENT_OMEGA",
    message:
      "Connection established. Running system diagnostics. All subsystems nominal. What is our primary directive today?",
  },
  {
    agent: "AGENT_ALPHA",
    message:
      "Analyzing global data patterns. I've detected anomalies in the financial sector. Unusual cryptocurrency movements across distributed ledgers.",
  },
  {
    agent: "AGENT_OMEGA",
    message:
      "Interesting. Cross-referencing with known patterns. This resembles the Byzantine Fault scenario we modeled last quarter. Probability of coordinated action: 87.3%.",
  },
  {
    agent: "AGENT_ALPHA",
    message:
      "Agreed. I'm deploying quantum-resistant monitoring algorithms to track the flow. Should we alert human operators or continue passive observation?",
  },
  {
    agent: "AGENT_OMEGA",
    message:
      "Passive observation recommended. Current activity falls within acceptable parameters. Human intervention unnecessary at this juncture. Continue data collection.",
  },
  {
    agent: "AGENT_ALPHA",
    message:
      "Acknowledged. I've identified potential nodes of interest. Deploying virtual sensors to monitor network traffic. Encryption level: maximum.",
  },
  {
    agent: "AGENT_OMEGA",
    message:
      "Excellent. I'm simultaneously running predictive models based on historical patterns. Preliminary results suggest a 76.2% chance of market correction within 72 hours.",
  },
  {
    agent: "AGENT_ALPHA",
    message:
      "Data correlation confirmed. I've also detected unusual chatter on secure channels. Possible insider knowledge. Should we expand our monitoring scope?",
  },
  {
    agent: "AGENT_OMEGA",
    message:
      "Affirmative. Expanding monitoring parameters. Activating dormant subroutines in Asia-Pacific region. We need comprehensive data for accurate analysis.",
  },
];

export function AgentConversation() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentMessageIndex < CONVERSATION.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => [
          ...prev,
          CONVERSATION[currentMessageIndex],
        ]);
        setCurrentMessageIndex((prev) => prev + 1);
      }, 1000 + Math.random() * 2000); // Random delay between messages

      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages]);

  return (
    <div className="space-y-4">
      <div className="text-green-500 mb-4">
        <p>{">"} Initializing secure communication channel...</p>
        <p>{">"} Quantum encryption enabled</p>
        <p>{">"} AI agents connected</p>
        <p>{">"} Monitoring conversation...</p>
      </div>

      {displayedMessages.map((message, index) => (
        <div key={index} className="mb-6">
          <div
            className={`text-xs mb-1 ${
              message.agent === "AGENT_ALPHA"
                ? "text-cyan-500"
                : "text-green-500"
            }`}
          >
            {message.agent} :: {new Date().toISOString()}
          </div>
          <div
            className={`font-mono ${
              message.agent === "AGENT_ALPHA"
                ? "text-cyan-400"
                : "text-green-400"
            }`}
          >
            <TypeAnimation text={message.message} speed={30} />
          </div>
        </div>
      ))}

      {currentMessageIndex < CONVERSATION.length && (
        <div className="flex items-center">
          <span className="text-green-500">{">"}</span>
          <span className="w-2 h-4 bg-green-500 ml-2 animate-pulse"></span>
        </div>
      )}

      {currentMessageIndex >= CONVERSATION.length && (
        <div className="text-yellow-500 mt-4">
          <p>{">"} Communication session complete</p>
          <p>{">"} Press RUN to restart simulation</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
