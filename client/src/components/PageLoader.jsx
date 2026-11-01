'use client';

import React, { useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import loaderAnimation from '@/assets/animations/vyparaSakhaLoading/VyaparSakhaOrbitLoader.json';
import cardAnimation from '@/assets/animations/vyparaSakhaLoading/VyaparSakhaLoaderCard.json';

/**
 * PageLoader
 * ==========
 * Official Vyapar Sakha AI animated mascot loader with rotating digital orbit
 * and floating business tiles (Inventory, Sales, Billing, Analytics, AI insights).
 *
 * Supports three containment modes:
 * - 'fullscreen': fixed full-screen overlay covering the entire viewport (login, logout, top navigations)
 * - 'content': embedded right-side loader (min-h-[70vh]) that fits cleanly inside content panes, leaving the sidebar visible and active!
 * - 'overlay': absolute overlay covering only its parent container (tables, cards, modal panels)
 *
 * @param {string} message - Status or informative message to display below the animation
 * @param {'orbit' | 'card'} variant - Animation display mode (default: 'orbit')
 * @param {'fullscreen' | 'content' | 'overlay'} containment - Containment mode (default: 'fullscreen')
 */
const PageLoader = ({ 
  message = 'Preparing your business workspace...', 
  variant = 'orbit',
  containment = 'fullscreen'
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isContent = containment === 'content';
  const isOverlay = containment === 'overlay';

  const containerClasses = isContent
    ? "relative w-full min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl overflow-hidden selection:bg-blue-500 selection:text-white"
    : isOverlay
    ? "absolute inset-0 z-30 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white"
    : "fixed inset-0 z-[999] flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white";

  const containerStyle = isContent
    ? { background: 'transparent' }
    : {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(248, 250, 252, 0.72)',
      };

  return (
    <div className={containerClasses} style={containerStyle}>
      {/* Ambient glowing backdrop elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:800ms]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Loader Container */}
      {variant === 'card' ? (
        /* Standalone Figma Full Card Variant */
        <div className="relative w-full max-w-[390px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/15 border border-white/80 bg-white/90 backdrop-blur-2xl">
          {mounted ? (
            <Lottie
              src={cardAnimation}
              loop
              autoplay
              className="w-full h-auto"
            />
          ) : (
            <div className="w-full h-[420px] flex items-center justify-center bg-slate-50/50 animate-pulse">
              <span className="text-sm font-bold text-slate-400">Loading...</span>
            </div>
          )}
        </div>
      ) : (
        /* Elevated Modern Card with Centered Mascot Orbit & Dynamic Message */
        <div className="relative flex flex-col items-center bg-white/85 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-slate-300/60 rounded-3xl px-8 py-7 sm:px-12 sm:py-9 max-w-sm sm:max-w-md w-full transition-all">
          
          {/* Mascot Animation with Digital Orbit */}
          <div className="relative w-72 h-52 sm:w-80 sm:h-56 flex items-center justify-center overflow-visible">
            {mounted ? (
              <Lottie
                src={loaderAnimation}
                loop
                autoplay
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 animate-pulse flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/30 animate-ping" />
              </div>
            )}
          </div>

          {/* Brand header & dynamic status message */}
          <div className="flex flex-col items-center gap-1.5 text-center mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Vyapar<span className="text-amber-500">Sakha</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                AI
              </span>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-normal px-2">
              {message}
            </p>
          </div>

          {/* Smooth animated progress dots */}
          <div className="flex items-center gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-bounce"
                style={{
                  animationDelay: `${i * 180}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageLoader;
