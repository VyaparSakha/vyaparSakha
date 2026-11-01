"use client";

import React from "react";

/**
 * AnimatedInventoryButton
 * =======================
 * Interactive celebratory SVG button for Inventory.
 * Matches the Purchases celebratory button with a vibrant blue/indigo theme.
 * Features:
 * - Joyful 3D parcel/inventory box animation
 * - Dynamic confetti particle burst on hover
 * - Floating festive star sparkle
 * - Ambient blue bloom glow filter
 * - Accessible keyboard & click navigation
 */
export default function AnimatedInventoryButton({
  onClick,
  className = "",
  title = "View Inventory",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full group ${className}`}
    >
      <svg
        viewBox="0 0 160 56"
        className="w-[126px] h-[44px] sm:w-[138px] sm:h-[48px] overflow-visible select-none pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ambient Blue & Cyan Bloom Filter */}
          <filter
            id="blue-celebrate-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              floodColor="#2563eb"
              floodOpacity="0.28"
              stdDeviation="6"
            />
            <feDropShadow
              dx="0"
              dy="1"
              floodColor="#3b82f6"
              floodOpacity="0.18"
              stdDeviation="2"
            />
          </filter>

          <radialGradient id="inv-sparkle-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="box-tape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="inv-pill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
        </defs>

        <style>{`
          .inv-btn-wrap {
            cursor: pointer;
            user-select: none;
            outline: none;
            transform-origin: 80px 28px;
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .inv-pill-bg {
            fill: url(#inv-pill-grad);
            stroke: #93c5fd;
            stroke-width: 1.75;
            rx: 28px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          /* Package / Box Animation */
          .box-icon {
            transform-origin: 32px 28px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .box-lid {
            transform-origin: 32px 19px;
            transition: transform 0.35s ease;
          }

          .inv-btn-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
            font-size: 15px;
            font-weight: 700;
            fill: #1d4ed8;
            letter-spacing: -0.2px;
            transition: fill 0.2s ease, transform 0.2s ease;
          }

          /* Celebration Confetti Particles & Stars */
          .celebration-group {
            pointer-events: none;
          }
          .inv-confetti {
            transform-origin: 32px 28px;
            opacity: 0;
            transition: all 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.4);
          }
          .ip1 { transform: scale(0.2) translate(0, 0); fill: #3b82f6; }
          .ip2 { transform: scale(0.2) translate(0, 0); fill: #06b6d4; }
          .ip3 { transform: scale(0.2) translate(0, 0); fill: #6366f1; }
          .ip4 { transform: scale(0.2) translate(0, 0); fill: #10b981; }
          .ip5 { transform: scale(0.2) translate(0, 0); fill: #f59e0b; }
          .ip6 { transform: scale(0.2) translate(0, 0); fill: #2563eb; }
          
          /* Celebration Sparkle Star */
          .inv-star-sparkle {
            opacity: 0;
            transform-origin: 32px 13px;
            transform: scale(0) rotate(-45deg);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* ================= HOVER CELEBRATION STATE ================= */
          .inv-btn-wrap:hover,
          button:hover .inv-btn-wrap {
            transform: translateY(-2.5px) scale(1.025);
            filter: url(#blue-celebrate-glow);
          }
          .inv-btn-wrap:hover .inv-pill-bg,
          button:hover .inv-pill-bg {
            stroke: #2563eb;
            stroke-width: 2.25;
            fill: #ffffff;
          }
          /* Dynamic Box Shake & Joyful Rotation */
          .inv-btn-wrap:hover .box-icon,
          button:hover .box-icon {
            transform: rotate(12deg) scale(1.18);
            animation: joyful-box-sway 1.4s ease-in-out infinite alternate;
          }
          .inv-btn-wrap:hover .box-lid,
          button:hover .box-lid {
            transform: translateY(-2px) scale(1.06);
          }

          /* Bursting Celebration Confetti on Hover */
          .inv-btn-wrap:hover .ip1, button:hover .ip1 {
            opacity: 1;
            transform: translate(-14px, -18px) scale(1.1) rotate(-25deg);
          }
          .inv-btn-wrap:hover .ip2, button:hover .ip2 {
            opacity: 1;
            transform: translate(13px, -20px) scale(1.2) rotate(35deg);
          }
          .inv-btn-wrap:hover .ip3, button:hover .ip3 {
            opacity: 1;
            transform: translate(-16px, 10px) scale(0.9) rotate(45deg);
          }
          .inv-btn-wrap:hover .ip4, button:hover .ip4 {
            opacity: 1;
            transform: translate(16px, 11px) scale(1) rotate(-40deg);
          }
          .inv-btn-wrap:hover .ip5, button:hover .ip5 {
            opacity: 1;
            transform: translate(0px, -22px) scale(1.2) rotate(20deg);
          }
          .inv-btn-wrap:hover .ip6, button:hover .ip6 {
            opacity: 1;
            transform: translate(-2px, 15px) scale(0.85);
          }
          .inv-btn-wrap:hover .inv-star-sparkle, button:hover .inv-star-sparkle {
            opacity: 1;
            transform: scale(1.2) rotate(15deg);
          }

          /* ================= ACTIVE / CLICK EXPLOSION ================= */
          .inv-btn-wrap:active, button:active .inv-btn-wrap {
            transform: translateY(1.5px) scale(0.95);
            transition-duration: 0.1s;
          }
          .inv-btn-wrap:active .inv-pill-bg, button:active .inv-pill-bg {
            fill: #dbeafe;
            stroke: #1d4ed8;
          }
          .inv-btn-wrap:active .box-icon, button:active .box-icon {
            transform: rotate(-18deg) scale(1.28);
          }
          .inv-btn-wrap:active .ip1, button:active .ip1 { transform: translate(-22px, -26px) scale(1.4) rotate(90deg); }
          .inv-btn-wrap:active .ip2, button:active .ip2 { transform: translate(22px, -28px) scale(1.5) rotate(-90deg); }
          .inv-btn-wrap:active .ip5, button:active .ip5 { transform: translate(0px, -30px) scale(1.6); }

          @keyframes joyful-box-sway {
            0% { transform: rotate(12deg) scale(1.18); }
            50% { transform: rotate(-10deg) scale(1.22); }
            100% { transform: rotate(8deg) scale(1.16); }
          }
        `}</style>

        <g className="inv-btn-wrap">
          {/* Base Pill */}
          <rect
            className="inv-pill-bg"
            x="3"
            y="3"
            width="154"
            height="50"
            rx="25"
          />

          {/* Celebration Confetti Particles Group */}
          <g className="celebration-group">
            {/* Confetti Ribbon 1 (Left Diamond) */}
            <polygon
              className="inv-confetti ip1"
              points="32,24 35,27 32,30 29,27"
            />
            {/* Confetti Ribbon 2 (Right Bar) */}
            <rect
              className="inv-confetti ip2"
              x="30"
              y="26"
              width="5.5"
              height="2.5"
              rx="1"
            />
            {/* Confetti Circle 3 (Bottom-Left) */}
            <circle className="inv-confetti ip3" cx="32" cy="28" r="2.2" />
            {/* Confetti Diamond 4 (Bottom-Right) */}
            <polygon
              className="inv-confetti ip4"
              points="32,25 34.5,27.5 32,30 29.5,27.5"
            />
            {/* Confetti Star-Dot 5 (Top Center) */}
            <circle className="inv-confetti ip5" cx="32" cy="27" r="2.4" />
            {/* Small Spark 6 */}
            <circle className="inv-confetti ip6" cx="32" cy="28" r="1.8" />
            {/* Festive Star Sparkle above box */}
            <path
              className="inv-star-sparkle"
              d="M32 9 L33.5 13 L37.5 14.5 L33.5 16 L32 20 L30.5 16 L26.5 14.5 L30.5 13 Z"
              fill="#0ea5e9"
            />
          </g>

          {/* Package / Inventory Box Icon */}
          <g className="box-icon">
            {/* Box Body with gradient & sleek corner rounding */}
            <rect
              x="22"
              y="20.5"
              width="20"
              height="17"
              rx="3.5"
              fill="#eff6ff"
              stroke="url(#box-grad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Box Vertical Packaging Tape */}
            <rect
              x="29.5"
              y="20.5"
              width="5"
              height="17"
              fill="url(#box-tape-grad)"
              opacity="0.85"
            />
            {/* Top Flap / Crease accent */}
            <path
              className="box-lid"
              d="M22 24.5 L32 28 L42 24.5"
              fill="none"
              stroke="url(#box-grad)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Inventory Tag / Heart Accent */}
            <circle cx="32" cy="32" r="1.6" fill="#2563eb" />
          </g>

          {/* Label */}
          <text className="inv-btn-text" x="51" y="33.5">
            Inventory
          </text>
        </g>
      </svg>
    </button>
  );
}

