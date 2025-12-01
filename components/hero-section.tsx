"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Calendar, MapPin, Trophy } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    setMounted(true)
    
    // Countdown to fest start date
    const targetDate = new Date("2025-12-15T00:00:00")
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        })
      }
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Animated gradient orb in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[600px] h-[600px]">
          {/* Glowing orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 via-transparent to-accent/10 blur-3xl animate-pulse-glow" />
          {/* Inner metallic shape */}
          <div className="absolute inset-20 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-80">
              <defs>
                <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#888888" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L180 100 L100 180 L20 100 Z"
                fill="none"
                stroke="url(#metalGradient)"
                strokeWidth="2"
                className="animate-float"
              />
              <circle cx="100" cy="100" r="60" fill="none" stroke="url(#metalGradient)" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        {/* Department Badge */}
        <div
          className={`transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}
        >
          <span className="inline-block px-6 py-2 glass text-xs tracking-[0.2em] uppercase rounded-full font-medium text-muted-foreground">
            {FEST_CONFIG.department} • {FEST_CONFIG.studentUnion}
          </span>
        </div>

        {/* Main Title */}
        <h1
          className={`mt-10 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="gradient-text">{FEST_CONFIG.name}</span>
          <br />
          <span className="text-foreground text-3xl md:text-4xl lg:text-5xl">{FEST_CONFIG.tagline}</span>
        </h1>

        {/* Countdown */}
        {countdown.days > 0 && (
          <div
            className={`mt-8 flex items-center gap-4 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">{countdown.days}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Days</div>
            </div>
            <span className="text-2xl text-muted-foreground">:</span>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{countdown.hours}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Hours</div>
            </div>
            <span className="text-2xl text-muted-foreground">:</span>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{countdown.minutes}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Mins</div>
            </div>
          </div>
        )}

        {/* Subtitle */}
        <p
          className={`mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          {FEST_CONFIG.fullName} – An extraordinary celebration of creativity, talent, and sportsmanship. 
          Join us for {FEST_CONFIG.days} days of unforgettable experiences.
        </p>

        {/* Event Info Bar */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-8 text-sm transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-accent" />
            <div className="flex flex-col">
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Location</span>
              <span className="font-medium">{FEST_CONFIG.college}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            <div className="flex flex-col">
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Date</span>
              <span className="font-medium">{FEST_CONFIG.dates}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-accent" />
            <div className="flex flex-col">
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Events</span>
              <span className="font-medium text-accent">{FEST_CONFIG.days} Days of Action</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mt-10 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <a
            href="#events"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium transition-all duration-300 hover:bg-foreground/90 hover:gap-4"
          >
            View Schedule
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
