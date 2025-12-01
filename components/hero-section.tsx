"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
            Department of Computer Science
          </span>
        </div>

        {/* Main Title */}
        <h1
          className={`mt-10 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="gradient-text">Art moves the mind</span>
          <br />
          <span className="text-foreground">sport moves the body</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          The 11th Student Union MCAS presents an extraordinary celebration of creativity and athleticism. Join us for
          an unforgettable experience.
        </p>

        {/* Event Info Bar */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-8 text-sm transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">Location</span>
            <span className="font-medium">Main Campus Arena</span>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">Date</span>
            <span className="font-medium">December 15-20, 2025</span>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">Admission</span>
            <span className="font-medium text-accent">Free Entry</span>
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
