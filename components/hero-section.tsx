"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, Trophy, Palette } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-radial-pastel">
      {/* Animated Blob Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-pink absolute -top-32 -left-32 w-[400px] h-[400px] opacity-50" style={{ animationDelay: '0s' }} />
        <div className="blob blob-blue absolute -top-20 -right-20 w-[350px] h-[350px] opacity-50" style={{ animationDelay: '2s' }} />
        <div className="blob blob-purple absolute top-1/3 -left-20 w-[300px] h-[300px] opacity-40" style={{ animationDelay: '4s' }} />
        <div className="blob blob-green absolute bottom-20 -right-32 w-[350px] h-[350px] opacity-40" style={{ animationDelay: '1s' }} />
        <div className="blob blob-yellow absolute -bottom-20 left-1/4 w-[250px] h-[250px] opacity-40" style={{ animationDelay: '3s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-28 pb-12">
        
        {/* Top Section - Logo and Title */}
        <div className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          
          {/* IBDA Union Logo */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 mb-6 animate-float-gentle">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--art-pink)] to-[var(--art-purple)] blur-2xl opacity-50" />
            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-800 shadow-xl">
              <Image
                src="/ibda.png"
                alt="IBDA - Student Union"
                fill
                className="object-contain p-3"
                priority
              />
            </div>
          </div>

          {/* Department Badge */}
          <span className="inline-flex items-center gap-2 px-6 py-2.5 glass-card text-sm tracking-wide rounded-full font-medium text-[var(--art-text)] mb-4">
            {FEST_CONFIG.department} • {FEST_CONFIG.studentUnion}
          </span>

          {/* Main Title */}
          <h1 className={`transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "200ms" }}>
            <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight gradient-text drop-shadow-sm">
              MCAS 2025
            </span>
            <span className="block text-xl md:text-2xl lg:text-3xl font-light text-[var(--art-text-light)] mt-3">
              {FEST_CONFIG.tagline}
            </span>
          </h1>
        </div>

        {/* Event Cards Section - Sports & Arts */}
        <div className={`mt-12 grid md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "300ms" }}>
          
          {/* Annual Sports Meet Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--art-green)] to-[var(--art-blue)] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100">
                <Image
                  src="/ANNUAL SPORTS MEET_20251203_101759_0000.png"
                  alt="Annual Sports Meet 2025"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-lg" style={{ background: 'rgba(212, 240, 240, 0.95)', color: '#0d9488' }}>
                    <Trophy size={16} />
                    SPORTS
                  </span>
                </div>
              </div>

              {/* Info Footer */}
              <div className="p-5 bg-white/50">
                <h3 className="text-xl font-bold text-[var(--art-text)] mb-1">Annual Sports Meet</h3>
                <p className="text-sm text-[var(--art-text-light)] mb-4">Compete. Conquer. Celebrate.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 240, 240, 0.8)' }}>
                      <Trophy size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--art-text)]">Day 1 & 2</p>
                      <p className="text-xs text-[var(--art-text-light)]">15 - 16 Dec 2025</p>
                    </div>
                  </div>
                  <a href="#events" className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1 group/btn" style={{ background: 'rgba(212, 240, 240, 0.9)', color: '#0d9488' }}>
                    View <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Arts Fest Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--art-pink)] to-[var(--art-purple)] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                <Image
                  src="/ANNUAL SPORTS MEET_20251203_101045_0000.png"
                  alt="Annual Arts Fest 2025"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-lg" style={{ background: 'rgba(230, 206, 242, 0.95)', color: '#9333ea' }}>
                    <Palette size={16} />
                    ARTS
                  </span>
                </div>
              </div>

              {/* Info Footer */}
              <div className="p-5 bg-white/50">
                <h3 className="text-xl font-bold text-[var(--art-text)] mb-1">Annual Arts Fest</h3>
                <p className="text-sm text-[var(--art-text-light)] mb-4">Create. Express. Inspire.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(230, 206, 242, 0.8)' }}>
                      <Palette size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--art-text)]">Day 3 & 4</p>
                      <p className="text-xs text-[var(--art-text-light)]">17 - 18 Dec 2025</p>
                    </div>
                  </div>
                  <a href="#events" className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1 group/btn" style={{ background: 'rgba(255, 209, 220, 0.9)', color: '#db2777' }}>
                    View <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`mt-12 flex flex-wrap gap-4 justify-center transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "400ms" }}>
          <a href="#events" className="group inline-flex items-center gap-2 px-8 py-4 btn-pastel-pink rounded-full font-semibold text-lg transition-all duration-300 hover:gap-4 hover:shadow-xl">
            🎨 Explore All Events
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a href="#scoreboard" className="group inline-flex items-center gap-2 px-8 py-4 btn-pastel-blue rounded-full font-semibold text-lg transition-all duration-300 hover:gap-4 hover:shadow-xl">
            🏆 Live Scoreboard
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[var(--art-text-light)]/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-[var(--art-accent)] animate-pulse" />
        </div>
      </div>
    </section>
  )
}
