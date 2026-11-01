"use client";

import React from "react";

/**
 * AnimatedPurchasesButton
 * =======================
 * Interactive celebratory SVG button for Purchases.
 * Features:
 * - Joyful swaying shopping bag icon
 * - Dynamic confetti particle burst on hover
 * - Floating star sparkle
 * - Warm ember glow filter
 * - Accessible keyboard & click navigation
 */
export default function AnimatedPurchasesButton({
  onClick,
  className = "",
  title = "View Purchases",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-full group ${className}`}
    >
      <svg
        viewBox="0 0 160 56"
        className="w-[126px] h-[44px] sm:w-[138px] sm:h-[48px] overflow-visible select-none pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Warm Ambient & Bloom Filters */}
          <filter
            id="ember-celebrate-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              floodColor="#ea580c"
              floodOpacity="0.32"
              stdDeviation="6"
            />
            <feDropShadow
              dx="0"
              dy="1"
              floodColor="#f97316"
              floodOpacity="0.2"
              stdDeviation="2"
            />
          </filter>

          <radialGradient id="sparkle-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="bag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="pill-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fff7ed" />
          </linearGradient>
        </defs>

        <style>{`
          .btn-wrap {
            cursor: pointer;
            user-select: none;
            outline: none;
            transform-origin: 80px 28px;
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .pill-bg {
            fill: url(#pill-fill-grad);
            stroke: #fdba74;
            stroke-width: 1.75;
            rx: 28px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          /* Packet / Shopping Bag Animation */
          .bag-icon {
            transform-origin: 32px 28px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .bag-handle {
            transform-origin: 32px 22px;
            transition: transform 0.35s ease;
          }

          .btn-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
            font-size: 15px;
            font-weight: 700;
            fill: #c2410c;
            letter-spacing: -0.2px;
            transition: fill 0.2s ease, transform 0.2s ease;
          }

          /* Celebration Confetti Particles & Stars */
          .celebration-group {
            pointer-events: none;
          }
          .confetti {
            transform-origin: 32px 28px;
            opacity: 0;
            transition: all 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.4);
          }
          .p1 { transform: scale(0.2) translate(0, 0); fill: #f97316; }
          .p2 { transform: scale(0.2) translate(0, 0); fill: #eab308; }
          .p3 { transform: scale(0.2) translate(0, 0); fill: #fb923c; }
          .p4 { transform: scale(0.2) translate(0, 0); fill: #ec4899; }
          .p5 { transform: scale(0.2) translate(0, 0); fill: #f59e0b; }
          .p6 { transform: scale(0.2) translate(0, 0); fill: #f97316; }
          
          /* Celebration Sparkle Star */
          .star-sparkle {
            opacity: 0;
            transform-origin: 32px 14px;
            transform: scale(0) rotate(-45deg);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* ================= HOVER CELEBRATION STATE ================= */
          .btn-wrap:hover,
          button:hover .btn-wrap {
            transform: translateY(-2.5px) scale(1.025);
            filter: url(#ember-celebrate-glow);
          }
          .btn-wrap:hover .pill-bg,
          button:hover .pill-bg {
            stroke: #ea580c;
            stroke-width: 2.25;
            fill: #ffffff;
          }
          /* Dynamic Bag Shake / Lift & Joyful Rotation */
          .btn-wrap:hover .bag-icon,
          button:hover .bag-icon {
            transform: rotate(-12deg) scale(1.18);
            animation: joyful-sway 1.4s ease-in-out infinite alternate;
          }
          .btn-wrap:hover .bag-handle,
          button:hover .bag-handle {
            transform: translateY(-2px) scaleY(1.08);
          }

          /* Bursting Celebration Confetti on Hover */
          .btn-wrap:hover .p1, button:hover .p1 {
            opacity: 1;
            transform: translate(-14px, -18px) scale(1.1) rotate(-25deg);
          }
          .btn-wrap:hover .p2, button:hover .p2 {
            opacity: 1;
            transform: translate(13px, -20px) scale(1.2) rotate(35deg);
          }
          .btn-wrap:hover .p3, button:hover .p3 {
            opacity: 1;
            transform: translate(-16px, 10px) scale(0.9) rotate(45deg);
          }
          .btn-wrap:hover .p4, button:hover .p4 {
            opacity: 1;
            transform: translate(16px, 11px) scale(1) rotate(-40deg);
          }
          .btn-wrap:hover .p5, button:hover .p5 {
            opacity: 1;
            transform: translate(0px, -22px) scale(1.2) rotate(20deg);
          }
          .btn-wrap:hover .p6, button:hover .p6 {
            opacity: 1;
            transform: translate(-2px, 15px) scale(0.85);
          }
          .btn-wrap:hover .star-sparkle, button:hover .star-sparkle {
            opacity: 1;
            transform: scale(1.2) rotate(15deg);
          }

          /* ================= ACTIVE / CLICK EXPLOSION ================= */
          .btn-wrap:active, button:active .btn-wrap {
            transform: translateY(1.5px) scale(0.95);
            transition-duration: 0.1s;
          }
          .btn-wrap:active .pill-bg, button:active .pill-bg {
            fill: #ffedd5;
            stroke: #c2410c;
          }
          .btn-wrap:active .bag-icon, button:active .bag-icon {
            transform: rotate(18deg) scale(1.28);
          }
          .btn-wrap:active .p1, button:active .p1 { transform: translate(-22px, -26px) scale(1.4) rotate(90deg); }
          .btn-wrap:active .p2, button:active .p2 { transform: translate(22px, -28px) scale(1.5) rotate(-90deg); }
          .btn-wrap:active .p5, button:active .p5 { transform: translate(0px, -30px) scale(1.6); }

          @keyframes joyful-sway {
            0% { transform: rotate(-12deg) scale(1.18); }
            50% { transform: rotate(10deg) scale(1.22); }
            100% { transform: rotate(-8deg) scale(1.16); }
          }
        `}</style>

        <g className="btn-wrap">
          {/* Base Pill */}
          <rect
            className="pill-bg"
            x="3"
            y="3"
            width="154"
            height="50"
            rx="25"
          />

          {/* Celebration Confetti Particles Group */}
          <g className="celebration-group">
            {/* Confetti Streamer 1 (Left Diamond) */}
            <polygon
              className="confetti p1"
              points="32,24 35,27 32,30 29,27"
            />
            {/* Confetti Ribbon 2 (Right Bar) */}
            <rect
              className="confetti p2"
              x="30"
              y="26"
              width="5.5"
              height="2.5"
              rx="1"
            />
            {/* Confetti Circle 3 (Bottom-Left) */}
            <circle className="confetti p3" cx="32" cy="28" r="2.2" />
            {/* Confetti Diamond 4 (Bottom-Right) */}
            <polygon
              className="confetti p4"
              points="32,25 34.5,27.5 32,30 29.5,27.5"
            />
            {/* Confetti Star-Dot 5 (Top Center) */}
            <circle className="confetti p5" cx="32" cy="27" r="2.4" />
            {/* Small Spark 6 */}
            <circle className="confetti p6" cx="32" cy="28" r="1.8" />
            {/* Festive Star Sparkle above bag */}
            <path
              className="star-sparkle"
              d="M32 9 L33.5 13 L37.5 14.5 L33.5 16 L32 20 L30.5 16 L26.5 14.5 L30.5 13 Z"
              fill="#f59e0b"
            />
          </g>

          {/* Shopping Packet / Bag Icon */}
          <g className="bag-icon">
            {/* Bag Body with gradient & sleek corner rounding */}
            <rect
              x="22"
              y="20.5"
              width="20"
              height="17"
              rx="4"
              fill="#fff7ed"
              stroke="url(#bag-grad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Packet Fold / Crease accent */}
            <path
              d="M22 25 C26 27.5, 38 27.5, 42 25"
              fill="none"
              stroke="url(#bag-grad)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Handles */}
            <path
              className="bag-handle"
              d="M28 20.5 V15.5 C28 13.3 29.8 11.5 32 11.5 C34.2 11.5 36 13.3 36 15.5 V20.5"
              fill="none"
              stroke="url(#bag-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Warm Spark Heart in Center */}
            <circle cx="32" cy="31" r="1.6" fill="#ea580c" />
          </g>

          {/* Label */}
          <text className="btn-text" x="53" y="33.5">
            Purchases
          </text>
        </g>
      </svg>
    </button>
  );
}

