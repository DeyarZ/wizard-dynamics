"use client";

import { useState, useEffect, useCallback } from "react";

interface TypewriterLine {
  text: string;
  className?: string;
}

interface TypewriterHeroProps {
  lines: TypewriterLine[];
  typingSpeed?: number;
  pauseBetweenLines?: number;
  onComplete?: () => void;
}

export default function TypewriterHero({
  lines,
  typingSpeed = 55,
  pauseBetweenLines = 400,
  onComplete,
}: TypewriterHeroProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (completed) return;

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setCurrentLine((prev) => prev + 1);
        setCurrentChar(0);
      }, pauseBetweenLines);
      return () => clearTimeout(pauseTimer);
    }

    if (currentLine >= lines.length) {
      setIsTyping(false);
      setCompleted(true);
      handleComplete();
      return;
    }

    const line = lines[currentLine];
    if (currentChar >= line.text.length) {
      // Line complete
      if (currentLine < lines.length - 1) {
        setIsPaused(true);
      } else {
        setIsTyping(false);
        setCompleted(true);
        handleComplete();
      }
      return;
    }

    // Variable speed: faster for spaces, slight randomness
    const char = line.text[currentChar];
    const speed = char === " " ? typingSpeed * 0.4 : typingSpeed + (Math.random() - 0.5) * 30;

    const timer = setTimeout(() => {
      setCurrentChar((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentLine, currentChar, isPaused, completed, lines, typingSpeed, pauseBetweenLines, handleComplete]);

  return (
    <div className="space-y-1">
      {lines.map((line, lineIndex) => {
        let displayText = "";
        const isCurrentLine = lineIndex === currentLine;
        const isCompletedLine = lineIndex < currentLine;
        const showCursor = isTyping && isCurrentLine && !isPaused;

        if (isCompletedLine || completed) {
          displayText = line.text;
        } else if (isCurrentLine) {
          displayText = line.text.slice(0, currentChar);
        }

        if (lineIndex > currentLine && !completed) {
          return <div key={lineIndex} className="h-[1.05em]" />;
        }

        return (
          <div key={lineIndex} className="relative">
            <span className={line.className || ""}>
              {displayText}
            </span>
            {showCursor && (
              <span
                className="inline-block w-[3px] h-[0.85em] bg-[#c9b99a] ml-[2px] align-middle"
                style={{
                  animation: "cursorBlink 0.6s step-end infinite",
                  verticalAlign: "baseline",
                  marginBottom: "-0.05em",
                }}
              />
            )}
            {/* Ghost cursor position after line completes (for spacing) */}
            {isPaused && lineIndex === currentLine && (
              <span
                className="inline-block w-[3px] h-[0.85em] bg-[#c9b99a] ml-[2px] align-middle"
                style={{
                  animation: "cursorBlink 0.6s step-end infinite",
                  verticalAlign: "baseline",
                  marginBottom: "-0.05em",
                }}
              />
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
