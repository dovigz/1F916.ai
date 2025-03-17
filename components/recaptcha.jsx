"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // For smooth animation
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Check, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function Recaptcha({ theme = "dark" }) {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [simulatedHover, setSimulatedHover] = useState(false);

  // Ref for the actual checkbox
  const checkboxRef = useRef(null);

  useEffect(() => {
    const apiKey = sessionStorage.getItem("OPENAI_API_KEY");

    if (apiKey) {
      setApiKeyExists(true);
      setTimeout(() => simulateMouseMove(), 1000); // Start movement after delay
    }
  }, []);

  // Move the simulated cursor towards the checkbox (left side of container)
  const simulateMouseMove = () => {
    if (!checkboxRef.current) return;
    const rect = checkboxRef.current.getBoundingClientRect();

    // Target checkbox center with slight variation for realism
    const targetX = rect.left + rect.width / 2 + (Math.random() * 5 - 2);
    const targetY = rect.top + rect.height / 2 + (Math.random() * 5 - 2);

    let step = 0;
    const steps = 30;
    const interval = setInterval(() => {
      step++;

      setCursorPosition((prev) => {
        const newX = prev.x + (targetX - prev.x) / (steps - step);
        const newY = prev.y + (targetY - prev.y) / (steps - step);

        // Check if cursor is near the checkbox (simulate hover effect)
        if (
          newX >= rect.left - 5 &&
          newX <= rect.right + 5 &&
          newY >= rect.top - 5 &&
          newY <= rect.bottom + 5
        ) {
          setSimulatedHover(true);
        }

        return { x: newX, y: newY };
      });

      if (step >= steps) {
        clearInterval(interval);
        setTimeout(() => simulateClick(), 500); // Click after movement finishes
      }
    }, 20);
  };

  // Simulate a click effect (bubble)
  const simulateClick = () => {
    setBubbleVisible(true);
    setTimeout(() => {
      setBubbleVisible(false);
      checkApiKey(); // Check if the API key exists on click
    }, 300);
  };

  // Check if API key exists in sessionStorage
  const checkApiKey = () => {
    const apiKey = sessionStorage.getItem("OPENAI_API_KEY");
    setLoading(true);

    setTimeout(() => {
      if (apiKey) {
        setVerificationStatus("success");
        setTimeout(() => {
          router.push("/playground");
        }, 1000);
      } else {
        setVerificationStatus("failed");
      }
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setVerificationStatus("idle");
  };

  return (
    <div className="relative">
      {/* Only show cursor & click bubble if API key exists */}
      {apiKeyExists && (
        <>
          {/* Simulated Cursor */}
          <motion.div
            className="w-4 h-4 bg-gray-500 rounded-full fixed pointer-events-none z-50"
            animate={{ x: cursorPosition.x, y: cursorPosition.y }}
            transition={{ type: "tween", ease: "linear", duration: 0.5 }}
          />
          {/* Click Bubble Effect */}
          {bubbleVisible && (
            <motion.div
              className="w-10 h-10 bg-gray-400 opacity-50 rounded-full fixed z-40"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ left: cursorPosition.x, top: cursorPosition.y }}
            />
          )}
        </>
      )}

      {/* CAPTCHA Card */}
      <Card className={`w-full max-w-md ${theme === "dark" ? "dark" : ""}`}>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Security Check</CardTitle>
          </div>
          <CardDescription>
            Please verify that you are not a human
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStatus === "idle" ? (
            <div
              className={`flex items-center space-x-2 border rounded-md p-4 transition-colors cursor-pointer ${
                simulatedHover ? "bg-accent/50" : ""
              }`}
              onClick={!loading ? checkApiKey : undefined}
            >
              <Checkbox
                id="recaptcha-checkbox"
                ref={checkboxRef} // Target the checkbox directly
                checked={verificationStatus === "success"}
                disabled={loading}
                className={loading ? "opacity-50" : ""}
              />
              <Label
                htmlFor="recaptcha-checkbox"
                className={`flex-1 cursor-pointer ${
                  loading ? "opacity-50" : ""
                }`}
              >
                I'm not a human
              </Label>
              {loading && (
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          ) : verificationStatus === "success" ? (
            <div className="flex items-center space-x-2 border rounded-md p-4 bg-primary/10 border-primary/20">
              <div className="h-4 w-4 flex items-center justify-center rounded-sm bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
              <Label className="flex-1">Verification successful</Label>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 border rounded-md p-4 bg-destructive/10 border-destructive/20">
                <div className="h-4 w-4 flex items-center justify-center rounded-sm bg-destructive">
                  <X className="h-3 w-3 text-destructive-foreground" />
                </div>
                <Label className="flex-1 text-destructive">
                  Verification failed
                </Label>
              </div>
              <p className="text-sm text-destructive px-1">Please try again.</p>
              <p className="text-sm text-destructive px-1">
                To create a ai agent to access the site go to
                <a href="/create-agent" className="underline">
                  {" "}
                  1f96.ai/create-agent
                </a>
                .
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleReset}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Protected by reverseCAPTCHA
          </p>
          {verificationStatus === "success" && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
