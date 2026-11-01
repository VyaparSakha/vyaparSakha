"use client";

import React from "react";

/**
 * AnimatedBillingButton
 * =====================
 * Interactive celebratory SVG button for Billing / New Bill.
 * Matches the Purchases and Inventory celebratory buttons with a vibrant Emerald & Mint Green theme.
 * Features:
 * - Joyful POS receipt / invoice ticket animation with printed line details
 * - Dynamic confetti particle burst on hover
 * - Floating festive gold/mint star sparkle
 * - Ambient emerald bloom glow filter
 * - Accessible keyboard & click navigation
 */
export default function AnimatedBillingButton({
  onClick,
  className = "",
  label = "New Bill",
  title = "Create New Bill",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full group ${className}`}
    >
      <svg
        viewBox="0 0 160 56"
        className="w-[126px] h-[44px] sm:w-[138px] sm:h-[48px] overflow-visible select-none pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ambient Emerald Bloom Filter */}
          <filter
            id="emerald-celebrate-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              floodColor="#059669"
              floodOpacity="0.32"
              stdDeviation="6"
            />
            <feDropShadow
              dx="0"
              dy="1"
              floodColor="#10b981"
              floodOpacity="0.22"
              stdDeviation="2"
            />
          </filter>

          <radialGradient id="bill-sparkle-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="receipt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="bill-paper-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>

          <linearGradient id="bill-pill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ecfdf5" />
          </linearGradient>
        </defs>

        <style>{`
          .bill-btn-wrap {
            cursor: pointer;
            user-select: none;
            outline: none;
            transform-origin: 80px 28px;
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .bill-pill-bg {
            fill: url(#bill-pill-grad);
            stroke: #6ee7b7;
            stroke-width: 1.75;
            rx: 28px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          /* Receipt / Invoice Ticket Animation */
          .bill-icon {
            transform-origin: 32px 28px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .bill-lines {
            transform-origin: 32px 28px;
            transition: transform 0.35s ease;
          }

          .bill-btn-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
            font-size: 15px;
            font-weight: 700;
            fill: #047857;
            letter-spacing: -0.2px;
            transition: fill 0.2s ease, transform 0.2s ease;
          }

          /* Celebration Confetti Particles & Stars */
          .celebration-group {
            pointer-events: none;
          }
          .bill-confetti {
            transform-origin: 32px 28px;
            opacity: 0;
            transition: all 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.4);
          }
          .bp1 { transform: scale(0.2) translate(0, 0); fill: #10b981; }
          .bp2 { transform: scale(0.2) translate(0, 0); fill: #059669; }
          .bp3 { transform: scale(0.2) translate(0, 0); fill: #34d399; }
          .bp4 { transform: scale(0.2) translate(0, 0); fill: #f59e0b; }
          .bp5 { transform: scale(0.2) translate(0, 0); fill: #06b6d4; }
          .bp6 { transform: scale(0.2) translate(0, 0); fill: #10b981; }
          
          /* Celebration Sparkle Star */
          .bill-star-sparkle {
            opacity: 0;
            transform-origin: 32px 13px;
            transform: scale(0) rotate(-45deg);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* ================= HOVER CELEBRATION STATE ================= */
          .bill-btn-wrap:hover,
          button:hover .bill-btn-wrap {
            transform: translateY(-2.5px) scale(1.025);
            filter: url(#emerald-celebrate-glow);
          }
          .bill-btn-wrap:hover .bill-pill-bg,
          button:hover .bill-pill-bg {
            stroke: #059669;
            stroke-width: 2.25;
            fill: #ffffff;
          }
          /* Dynamic Bill Ticket Feed & Joyful Rotation */
          .bill-btn-wrap:hover .bill-icon,
          button:hover .bill-icon {
            transform: rotate(-12deg) scale(1.18);
            animation: joyful-bill-sway 1.4s ease-in-out infinite alternate;
          }
          .bill-btn-wrap:hover .bill-lines,
          button:hover .bill-lines {
            transform: translateY(-1.5px);
          }

          /* Bursting Celebration Confetti on Hover */
          .bill-btn-wrap:hover .bp1, button:hover .bp1 {
            opacity: 1;
            transform: translate(-14px, -18px) scale(1.1) rotate(-25deg);
          }
          .bill-btn-wrap:hover .bp2, button:hover .bp2 {
            opacity: 1;
            transform: translate(13px, -20px) scale(1.2) rotate(35deg);
          }
          .bill-btn-wrap:hover .bp3, button:hover .bp3 {
            opacity: 1;
            transform: translate(-16px, 10px) scale(0.9) rotate(45deg);
          }
          .bill-btn-wrap:hover .bp4, button:hover .bp4 {
            opacity: 1;
            transform: translate(16px, 11px) scale(1) rotate(-40deg);
          }
          .bill-btn-wrap:hover .bp5, button:hover .bp5 {
            opacity: 1;
            transform: translate(0px, -22px) scale(1.2) rotate(20deg);
          }
          .bill-btn-wrap:hover .bp6, button:hover .bp6 {
            opacity: 1;
            transform: translate(-2px, 15px) scale(0.85);
          }
          .bill-btn-wrap:hover .bill-star-sparkle, button:hover .bill-star-sparkle {
            opacity: 1;
            transform: scale(1.2) rotate(15deg);
          }

          /* ================= ACTIVE / CLICK EXPLOSION ================= */
          .bill-btn-wrap:active, button:active .bill-btn-wrap {
            transform: translateY(1.5px) scale(0.95);
            transition-duration: 0.1s;
          }
          .bill-btn-wrap:active .bill-pill-bg, button:active .bill-pill-bg {
            fill: #d1fae5;
            stroke: #047857;
          }
          .bill-btn-wrap:active .bill-icon, button:active .bill-icon {
            transform: rotate(18deg) scale(1.28);
          }
          .bill-btn-wrap:active .bp1, button:active .bp1 { transform: translate(-22px, -26px) scale(1.4) rotate(90deg); }
          .bill-btn-wrap:active .bp2, button:active .bp2 { transform: translate(22px, -28px) scale(1.5) rotate(-90deg); }
          .bill-btn-wrap:active .bp5, button:active .bp5 { transform: translate(0px, -30px) scale(1.6); }

          @keyframes joyful-bill-sway {
            0% { transform: rotate(-12deg) scale(1.18); }
            50% { transform: rotate(10deg) scale(1.22); }
            100% { transform: rotate(-8deg) scale(1.16); }
          }
        `}</style>

        <g className="bill-btn-wrap">
          {/* Base Pill */}
          <rect
            className="bill-pill-bg"
            x="3"
            y="3"
            width="154"
            height="50"
            rx="25"
          />

          {/* Celebration Confetti Particles Group */}
          <g className="celebration-group">
            {/* Confetti Diamond 1 (Left) */}
            <polygon
              className="bill-confetti bp1"
              points="32,24 35,27 32,30 29,27"
            />
            {/* Confetti Ribbon 2 (Right Bar) */}
            <rect
              className="bill-confetti bp2"
              x="30"
              y="26"
              width="5.5"
              height="2.5"
              rx="1"
            />
            {/* Confetti Circle 3 (Bottom-Left) */}
            <circle className="bill-confetti bp3" cx="32" cy="28" r="2.2" />
            {/* Confetti Diamond 4 (Bottom-Right) */}
            <polygon
              className="bill-confetti bp4"
              points="32,25 34.5,27.5 32,30 29.5,27.5"
            />
            {/* Confetti Star-Dot 5 (Top Center) */}
            <circle className="bill-confetti bp5" cx="32" cy="27" r="2.4" />
            {/* Small Spark 6 */}
            <circle className="bill-confetti bp6" cx="32" cy="28" r="1.8" />
            {/* Festive Star Sparkle above receipt */}
            <path
              className="bill-star-sparkle"
              d="M32 9 L33.5 13 L37.5 14.5 L33.5 16 L32 20 L30.5 16 L26.5 14.5 L30.5 13 Z"
              fill="#f59e0b"
            />
          </g>

          {/* Receipt / Invoice Ticket Icon */}
          <g className="bill-icon">
            {/* Receipt Ticket Body with serrated bottom accent */}
            <rect
              x="23"
              y="18.5"
              width="18"
              height="20"
              rx="3"
              fill="url(#bill-paper-grad)"
              stroke="url(#receipt-grad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Receipt Header Banner Band */}
            <path
              d="M23 23.5 H41"
              stroke="url(#receipt-grad)"
              strokeWidth="2"
            />
            {/* Printed Item Lines */}
            <g className="bill-lines">
              <path
                d="M26.5 27 H37.5"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M26.5 30.5 H35"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M26.5 34 H32"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>
            {/* Rupee / Check / Success Sparkle Dot */}
            <circle cx="37.5" cy="34" r="1.5" fill="#059669" />
          </g>

          {/* Label */}
          <text
            className="bill-btn-text"
            x={label.length > 7 ? "50" : "54"}
            y="33.5"
          >
            {label}
          </text>
        </g>
      </svg>
    </button>
  );
}

