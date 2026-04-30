import React, { useMemo } from "react";
import WorldtechBG from "../images/Worldtech background.png";

// Generate a deterministic grid of logos with randomized properties
const LOGO_COUNT = 40;

function generateLogos() {
  // Use a seeded-like approach so positions are consistent across renders
  const logos = [];
  const cols = 8;
  const rows = 5;
  let i = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (i >= LOGO_COUNT) break;
      // Spread across the screen with slight jitter
      const jitterX = ((i * 37 + row * 13) % 15) - 7;
      const jitterY = ((i * 23 + col * 17) % 15) - 7;

      logos.push({
        id: i,
        left: `${(col / cols) * 100 + jitterX / 10}%`,
        top: `${(row / rows) * 100 + jitterY / 10}%`,
        size: 60 + ((i * 11) % 60), // 60–120px
        opacity: 0.08 + ((i * 5) % 12) / 100, // 0.08–0.20 (subtle)
        // Each logo gets a unique animation duration and delay
        duration: 8 + ((i * 3) % 14), // 8–22s
        delay: -((i * 5) % 20), // stagger
        blur: 2 + (i % 3), // 2–4px blur on all logos
        // 3 different drift patterns
        driftClass: ["drift-a", "drift-b", "drift-c"][i % 3],
      });
      i++;
    }
  }
  return logos;
}

export default function AnimatedLogoBackground() {
  const logos = useMemo(() => generateLogos(), []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {logos.map((logo) => (
        <img
          key={logo.id}
          src={WorldtechBG}
          alt=""
          className={`absolute select-none ${logo.driftClass}`}
          style={{
            left: logo.left,
            top: logo.top,
            width: logo.size,
            height: logo.size,
            opacity: logo.opacity,
            objectFit: "contain",
            filter: `blur(${logo.blur}px) brightness(1.8)`,
            animationDuration: `${logo.duration}s`,
            animationDelay: `${logo.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}
