"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Sparkles, Play, Star, Rocket } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

interface LaunchScreenProps {
  onLaunch: () => void
}

export function LaunchScreen({ onLaunch }: LaunchScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleLaunch = () => {
    setLaunching(true)
    setCountdown(3)
  }

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 600)
      return () => clearTimeout(timer)
    } else {
      // Launch when countdown reaches 0
      const timer = setTimeout(() => onLaunch(), 400)
      return () => clearTimeout(timer)
    }
  }, [countdown, onLaunch])

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out ${
        countdown === 0 ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Pastel Gradient Background - Matching app theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--art-cream)] via-[var(--art-blue)]/30 to-[var(--art-pink)]/30 dark:from-[#1a1a2e] dark:via-[#2a2a4e] dark:to-[#1a1a2e]">
        {/* Animated pastel orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-purple)]/40 blur-[80px] animate-blob" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-pink)]/40 blur-[80px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] right-[10%] w-[35%] h-[35%] rounded-full bg-[var(--art-blue)]/40 blur-[60px] animate-blob animation-delay-4000" />
        <div className="absolute bottom-[30%] left-[5%] w-[30%] h-[30%] rounded-full bg-[var(--art-green)]/30 blur-[60px] animate-blob" />
        
        {/* Subtle floating shapes */}
        <div className="absolute top-[20%] left-[15%] w-4 h-4 rounded-full bg-[var(--art-pink)] opacity-60 animate-float-gentle" />
        <div className="absolute top-[60%] right-[20%] w-3 h-3 rounded-full bg-[var(--art-purple)] opacity-50 animate-float-gentle animation-delay-2000" />
        <div className="absolute bottom-[25%] left-[25%] w-5 h-5 rounded-full bg-[var(--art-blue)] opacity-40 animate-float-gentle animation-delay-4000" />
        <div className="absolute top-[15%] right-[25%] w-2 h-2 rounded-full bg-[var(--art-yellow)] opacity-70 animate-float-gentle" />
        <div className="absolute bottom-[40%] right-[15%] w-3 h-3 rounded-full bg-[var(--art-green)] opacity-50 animate-float-gentle animation-delay-4000" />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative">
            {/* Ripple effect */}
            <div className="absolute inset-0 animate-ping">
              <div className="w-40 h-40 rounded-full border-4 border-[var(--art-accent)]/50" />
            </div>
            <div className="absolute inset-0 animate-ping animation-delay-200">
              <div className="w-40 h-40 rounded-full border-2 border-[var(--art-purple)]/30" />
            </div>
            {/* Countdown number */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-accent)] flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-7xl font-black text-white drop-shadow-lg animate-bounce">
                {countdown}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center text-center px-6 w-full max-w-lg transition-all duration-500 ${
        launching ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
      }`}>
        
        {/* Top Badge */}
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 border border-white/50 dark:border-white/20 shadow-lg backdrop-blur-sm mb-8 transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <Star size={14} className="text-[var(--art-accent)] fill-current animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-[var(--art-text)] dark:text-white/80">{FEST_CONFIG.studentUnion}</span>
        </div>

        {/* Logo */}
        <div 
          className={`relative mb-8 transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Outer glow effect */}
          <div className="absolute -inset-10 bg-gradient-to-r from-[var(--art-pink)]/40 via-[var(--art-purple)]/40 to-[var(--art-blue)]/40 blur-[60px] rounded-full animate-pulse-glow" />
          
          {/* Spinning gradient ring - outer */}
          <div className="absolute -inset-3 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-conic animate-spin-slow" />
          </div>
          
          {/* Inner background to create ring effect */}
          <div className="absolute -inset-1 rounded-xl bg-[var(--art-cream)] dark:bg-[#1a1a2e]" />
          
          {/* Logo container with black background */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl bg-black shadow-2xl overflow-hidden border-2 border-white/50 dark:border-white/10">
            <Image
              src="/ibda.png"
              alt="IBDA"
              fill
              className="object-contain p-2"
              priority
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
            />
          </div>
        </div>

        {/* Title */}
        <div 
          className={`mb-4 transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '350ms' }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[var(--art-text)] dark:text-white leading-none drop-shadow-sm">
            MCAS
          </h1>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-accent)] mt-1 animate-gradient-x">
            2025
          </span>
        </div>

        {/* Tagline */}
        <p 
          className={`text-sm sm:text-base md:text-lg text-[var(--art-text-light)] dark:text-white/60 font-medium max-w-sm mb-10 transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          {FEST_CONFIG.tagline}
        </p>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={launching}
          className={`group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl active:scale-95 disabled:pointer-events-none shadow-xl ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${launching ? 'animate-pulse' : ''}`}
          style={{ transitionDelay: '550ms' }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-accent)]" />
          
          {/* Animated border glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-accent)] opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Button content */}
          <span className="relative flex items-center gap-3 text-white drop-shadow-sm">
            {launching ? (
              <Rocket size={22} className="animate-bounce" />
            ) : (
              <Play size={22} className="fill-current group-hover:scale-110 transition-transform" />
            )}
            <span>{launching ? 'Launching...' : 'Enter Experience'}</span>
            <Sparkles size={18} className={`transition-all duration-300 ${launching ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} />
          </span>
        </button>

        {/* Bottom text */}
        <p 
          className={`mt-10 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--art-text-light)]/50 dark:text-white/30 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '650ms' }}
        >
          Malabar College Arts & Sports Fest
        </p>
      </div>
    </div>
  )
}
