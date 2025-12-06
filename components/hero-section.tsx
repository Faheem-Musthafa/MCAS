"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, Trophy, Sparkles, Play, Zap, Star } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([])

  useEffect(() => {
    setMounted(true)
    setParticles(
      [...Array(12)].map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${i * 0.5}s`,
        duration: `${4 + Math.random() * 4}s`,
      }))
    )
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-purple)]/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--art-blue)]/20 blur-[120px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] rounded-full bg-[var(--art-pink)]/10 blur-[100px] animate-pulse-slow animation-delay-4000" />
        
        {/* Floating particles */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--art-accent)]/60 animate-float-gentle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-20 md:py-24">
          <div className="max-w-7xl w-full mx-auto">
            
            {/* Top Badge Row */}
            <div className={`flex flex-wrap justify-center items-center gap-4 mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {/* Live Badge */}
              <div className="glass-card inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--art-accent)]/30">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--art-accent)]" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--art-accent)] animate-ping" />
                </div>
                <span className="text-sm font-bold text-[var(--art-accent)] uppercase tracking-wider">Live Now</span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
              
              {/* Student Union Badge */}
              <div className="glass-card inline-flex items-center gap-2 px-4 py-2 rounded-full">
                <Sparkles size={14} className="text-[var(--art-purple)]" />
                <span className="text-sm font-medium text-[var(--art-text-light)]">{FEST_CONFIG.studentUnion}</span>
              </div>
            </div>

            {/* Main Hero Content */}
            <div className={`text-center mb-12 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              {/* Logo with enhanced styling */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  {/* Outer glow ring */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[var(--art-pink)]/50 via-[var(--art-purple)]/50 to-[var(--art-blue)]/50 blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Spinning border */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-purple)] to-[var(--art-blue)] animate-spin-slow opacity-70" />
                  
                  {/* Logo container */}
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden p-3">
                    <Image
                      src="/ibda.png"
                      alt="IBDA"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Department subtitle */}
              <p className="text-xs md:text-xl font-medium text-slate-500 tracking-[0.3em] uppercase mb-6">
                {FEST_CONFIG.department}
              </p>
              
              {/* Main Title with stacked layout */}
              <div className="mb-8 relative">
                <h1 className="relative inline-block">
                  {/* Decorative elements */}
                  <Star className="absolute -top-4 -left-8 md:-left-16 w-6 h-6 text-[var(--art-yellow)] animate-pulse" />
                  <Star className="absolute -bottom-2 -right-6 md:-right-12 w-4 h-4 text-[var(--art-pink)] animate-pulse animation-delay-2000" />
                  
                  <span className="block text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tighter text-slate-900 leading-[0.85] drop-shadow-sm">
                    MCAS
                  </span>
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] leading-[0.9] mt-2 drop-shadow-md pb-4">
                    2025
                  </span>
                </h1>
              </div>
              
              {/* Tagline with enhanced styling */}
              <div className="relative max-w-xl mx-auto">
                <p className="text-lg md:text-xl lg:text-2xl text-slate-600 font-light leading-relaxed">
                  {FEST_CONFIG.tagline}
                </p>
                {/* Decorative line */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[var(--art-pink)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--art-accent)]" />
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[var(--art-blue)]" />
                </div>
              </div>
            </div>

            {/* Logos Section - Ujjwalam X Polika */}
            <div className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 mb-20 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              {/* Ujjwalam Logo */}
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--art-pink)]/40 to-[var(--art-purple)]/40 blur-[60px] rounded-full opacity-40 group-hover:opacity-100 transition-all duration-700 scale-75 group-hover:scale-125" />
                <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-72 lg:h-72 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Image
                    src="/ujjwalam.png"
                    alt="Ujjwalam Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              {/* The X */}
              <div className="relative flex flex-col items-center justify-center z-10">
                <span className="text-6xl md:text-9xl font-black text-slate-200 select-none scale-150 transform">X</span>
              </div>

              {/* Polika Logo */}
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-tl from-[var(--art-blue)]/40 to-[var(--art-green)]/40 blur-[60px] rounded-full opacity-40 group-hover:opacity-100 transition-all duration-700 scale-75 group-hover:scale-125" />
                <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-72 lg:h-72 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Image
                    src="/polika.png"
                    alt="Polika Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

            </div>

            {/* CTA Section - Enhanced */}
            <div className={`flex flex-col items-center gap-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              {/* Primary Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="#events" 
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[var(--art-text)] overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-accent)] to-[var(--art-pink)] bg-[length:200%_100%] animate-shimmer" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <span className="relative flex items-center gap-3">
                    <Play size={18} className="fill-current" />
                    Explore Events
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
                
                <a 
                  href="#scoreboard" 
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[var(--art-text)] overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--art-blue)] via-[var(--art-green)] to-[var(--art-blue)] bg-[length:200%_100%]" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <span className="relative flex items-center gap-3">
                    <Trophy size={18} />
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
