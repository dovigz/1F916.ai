"use client";

import { useState, useEffect } from "react";

export function TypeAnimation({ text, speed = 50 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const randomSpeed = speed - 10 + Math.random() * 20; // Add some randomness to typing speed
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, randomSpeed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="relative">
      <span>{displayedText}</span>
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"></span>
      )}
    </div>
  );
}
