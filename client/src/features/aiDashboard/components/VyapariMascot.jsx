"use client";

import React, { useState, useEffect } from "react";
import { Lottie } from "lottie-react";
import { chatbotAnimations } from "@/assets/animations/Chatbot";

/**
 * VyapariMascot
 * =============
 * Renders the official Vyapar Sakha AI Mascot using high-fidelity Lottie vector animations.
 *
 * Supported states:
 * - "idle": Resting loop (3s loop)
 * - "greeting": Welcoming/waving animation (2s one-shot)
 * - "thinking": Processing reasoning loop (2.8s loop)
 * - "success" | "happy": Celebration/answer completed (2s one-shot)
 * - "error": Warning/confusion reaction (2s one-shot)
 * - "notification": Bell/ping alert pulse (1.6s one-shot)
 */
export default function VyapariMascot({
  state = "idle",
  onComplete,
  className = "w-full h-full flex items-center justify-center",
  loop = null,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animationData = chatbotAnimations[state] || chatbotAnimations.idle;
  const isLoopingState = state === "idle" || state === "thinking";
  const shouldLoop = loop !== null ? loop : isLoopingState;

  if (!mounted) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <Lottie
        key={state}
        src={animationData}
        loop={shouldLoop}
        autoplay
        subscriptions={{
          complete: () => {
            if (onComplete) onComplete();
          },
        }}
        className="w-full h-full"
      />
    </div>
  );
}
