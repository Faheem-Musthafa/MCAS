"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, Trophy, Sparkles, Play } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Small delay for smooth initial render
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Simplified Background - No heavy animations, reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static Gradient Orbs - reduced blur for mobile performance */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-purple)]/15 blur-[40px] md:blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-blue)]/15 blur-[40px] md:blur-[80px]" />
        <div className="hidden md:block absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] rounded-full bg-[var(--art-pink)]/10 blur-[60px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-7xl w-full mx-auto">
            
            {/* Top Badge Row */}
            <div 
              className={`flex flex-wrap justify-center items-center gap-3 mb-6 transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[var(--art-accent)]/30">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--art-accent)]" />
                  <div className="absolute w-2 h-2 rounded-full bg-[var(--art-accent)] animate-ping" />
                </div>
                <span className="text-xs font-bold text-[var(--art-accent)] uppercase tracking-wider">Live Now</span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-8 h-px bg-[var(--border)]" />
              
              {/* Student Union Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60">
                <Sparkles size={12} className="text-[var(--art-purple)]" />
                <span className="text-xs font-medium text-[var(--art-text-light)]">{FEST_CONFIG.studentUnion}</span>
              </div>
            </div>

            {/* Main Hero Content */}
            <div 
              className={`text-center mb-10 transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              
              {/* Logo - Simplified for mobile */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  {/* Single glow layer */}
                  <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[var(--art-pink)]/40 via-[var(--art-purple)]/40 to-[var(--art-blue)]/40 blur-xl opacity-60" />
                  
                  {/* Gradient border */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-blue)] opacity-70" />
                  
                  {/* Logo container */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                    <Image
                      src="/ibda.png"
                      alt="IBDA"
                      fill
                      className="object-contain p-2"
                      priority
                      sizes="(max-width: 768px) 80px, 96px"
                    />
                  </div>
                </div>
              </div>

              {/* Department subtitle */}
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 tracking-[0.2em] uppercase mb-4">
                {FEST_CONFIG.department}
              </p>
              
              {/* Main Title - Optimized sizes for mobile */}
              <div className="mb-6">
                <h1>
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-none">
                    MCAS
                  </span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] mt-1">
                    2025
                  </span>
                </h1>
              </div>
              
              {/* Tagline */}
              <div className="max-w-md mx-auto">
                <p className="text-sm sm:text-base md:text-lg text-slate-600 font-light leading-relaxed">
                  {FEST_CONFIG.tagline}
                </p>
                {/* Decorative line */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[var(--art-pink)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--art-accent)]" />
                  <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[var(--art-blue)]" />
                </div>
              </div>
            </div>

            {/* Logos Section - Ujjwalam X Polika */}
            <div 
              className={`flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-16 mb-10 md:mb-12 transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              
              {/* Ujjwalam Logo */}
              <div className="relative">
                <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-[var(--art-pink)]/30 to-[var(--art-purple)]/30 blur-[40px] rounded-full opacity-50" />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-56 lg:h-56">
                  <Image
                    src="/ujjwalam.png"
                    alt="Ujjwalam Logo"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 176px, 224px"
                  />
                </div>
              </div>

              {/* The X */}
              <div className="flex items-center justify-center">
                <span className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-200 select-none">X</span>
              </div>

              {/* Polika Logo */}
              <div className="relative">
                <div className="hidden md:block absolute inset-0 bg-gradient-to-tl from-[var(--art-blue)]/30 to-[var(--art-green)]/30 blur-[40px] rounded-full opacity-50" />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-56 lg:h-56">
                  <Image
                    src="/polika.png"
                    alt="Polika Logo"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 176px, 224px"
                  />
                </div>
              </div>

            </div>

            {/* CTA Section */}
            <div 
              className={`flex flex-col items-center gap-6 transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
                <a 
                  href="#events" 
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-base text-white overflow-hidden transition-transform duration-300 active:scale-95 btn-readable"
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-accent)] to-[var(--art-pink)] bg-[length:200%_100%]" />
                  
                  <span className="relative flex items-center gap-2 text-shadow">
                    <Play size={16} className="fill-current" />
                    Explore Events
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
                
                <a 
                  href="#scoreboard" 
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm sm:text-base text-white overflow-hidden transition-transform duration-300 active:scale-95"
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--art-blue)] via-[var(--art-green)] to-[var(--art-blue)] bg-[length:200%_100%]" />
                  
                  <span className="relative flex items-center gap-2">
                    <Trophy size={16} />
                    Live Scoreboard
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
