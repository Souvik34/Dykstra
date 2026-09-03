/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScreenLoaderProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
  interview?: boolean;
}

const INTERVIEW_MESSAGES = [
  "Sit back and relax",
  "Take a deep breath",
  "Your interview is getting ready",
  "Make yourself comfortable",
  "You're about to begin",
  "Good luck — you've got this",
];

export function ScreenLoader({
  text = "Loading",
  fullScreen = true,
  className,
  interview = false,
}: ScreenLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!interview) return;

    const interval = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setMessageIndex(
          (current) => (current + 1) % INTERVIEW_MESSAGES.length
        );
        setVisible(true);
      }, 350);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [interview]);

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[#050608]",
        fullScreen && "fixed inset-0 z-[999999]",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          interview && "gap-8"
        )}
      >
        {/* Existing loader / globe */}
        <div className="loader-wrapper">
          {!interview &&
            text.split("").map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="loader-letter"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}

          <div className="loader" />
        </div>

        {/* Interview-only messages */}
        {interview && (
          <div className="h-6 overflow-hidden text-center">
            <p
              className={cn(
                "text-sm font-medium tracking-wide text-white/75",
                "transition-all duration-350 ease-out",
                visible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0"
              )}
            >
              {INTERVIEW_MESSAGES[messageIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}