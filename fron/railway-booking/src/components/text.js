"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const TextHoverEffect = ({ text, duration = 0.3 }) => {
  const svgRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setCursor({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className="select-none cursor-pointer"
    >
      <defs>
        {/* Base gradient (always visible but subtle) */}
        <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1d5db" /> {/* Light gray */}
          <stop offset="100%" stopColor="#9ca3af" /> {/* Medium gray */}
        </linearGradient>

        {/* Glow gradient (activated on hover) */}
        <linearGradient id="glowGradient">
          <stop offset="0%" stopColor="#eab308" /> {/* Yellow */}
          <stop offset="25%" stopColor="#ef4444" /> {/* Red */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
          <stop offset="75%" stopColor="#06b6d4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* Purple */}
        </linearGradient>

        {/* Mask that follows cursor */}
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r={hovered ? "30%" : "60%"}
          cx={`${(cursor.x / 300) * 100}%`}
          cy={`${(cursor.y / 100) * 100}%`}
          animate={{
            cx: `${(cursor.x / 300) * 100}%`,
            cy: `${(cursor.y / 100) * 100}%`,
            r: hovered ? "30%" : "60%"
          }}
          transition={{ duration }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {/* Base text (always visible) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        stroke="url(#baseGradient)"
        className="fill-transparent font-bold text-7xl"
      >
        {text}
      </text>

      {/* Glow text (revealed on hover) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        stroke="url(#glowGradient)"
        mask="url(#textMask)"
        className="fill-transparent font-bold text-7xl"
        style={{
          opacity: hovered ? 1 : 0,
          transition: `opacity ${duration}s ease-in-out`
        }}
      >
        {text}
      </text>
    </svg>
  );
};

export default TextHoverEffect;