"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Menu, X, Sparkles, Calendar, Trophy, ImageIcon, ArrowRight, Award } from "lucide-react"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Detect active section
      const sections = ["events", "scoreboard", "results", "gallery"]
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navItems = [
    { name: "Events", href: "#events", id: "events", icon: Calendar, color: "var(--art-pink)" },
    { name: "Scores", href: "#scoreboard", id: "scoreboard", icon: Trophy, color: "var(--art-blue)" },
    { name: "Results", href: "#results", id: "results", icon: Award, color: "var(--art-gold)" },
    { name: "Gallery", href: "#gallery", id: "gallery", icon: ImageIcon, color: "var(--art-purple)" },
  ]

  return (
    <>
      <nav
        className={cn(
          "fixed top-3 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[calc(100%-1.5rem)] sm:w-auto max-w-md sm:max-w-none touch-feedback",
          scrolled 
            ? "bg-white/85 dark:bg-slate-900/85 shadow-2xl shadow-black/10 scale-[0.98]" 
            : "bg-white/70 dark:bg-slate-900/70 shadow-xl shadow-black/5",
          "backdrop-blur-lg md:backdrop-blur-xl border border-white/40 dark:border-white/10",
          "px-2 sm:px-3 py-2 sm:py-2.5 rounded-2xl sm:rounded-full"
        )}
      >
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--art-pink)] to-[var(--art-purple)] opacity-0 group-hover:opacity-30 transition-opacity" />
              <Image
                src="/ibda.png"
                alt="IBDA"
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black gradient-text leading-tight">MCAS</span>
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block leading-tight">2025</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 bg-white/30 dark:bg-white/5 rounded-full p-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 group",
                  activeSection === item.id
                    ? "text-[var(--art-text)] bg-white/80 dark:bg-white/20 shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeSection === item.id && (
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <item.icon size={14} className={cn(
                    "transition-colors",
                    activeSection === item.id ? "text-[var(--art-accent)]" : "group-hover:text-[var(--art-accent)]"
                  )} />
                  {item.name}
                </span>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* CTA Button - Desktop */}
          <a
            href="#events"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group relative bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-accent)] to-[var(--art-purple)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles size={14} className="text-white relative z-10" />
            <span className="text-white relative z-10">Explore</span>
          </a>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className={cn(
              "md:hidden p-2.5 rounded-xl transition-all duration-300",
              mobileOpen 
                ? "bg-[var(--art-accent)] text-white rotate-90" 
                : "hover:bg-white/50 dark:hover:bg-white/10 text-foreground"
            )}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300 safe-area-inset",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-[var(--background)]/90 backdrop-blur-lg transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Menu Content */}
        <div 
          className={cn(
            "absolute inset-x-3 top-20 transition-all duration-400 ease-out gpu-accelerated",
            mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          {/* Glass Card Menu */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/20 dark:border-white/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Navigation</p>
            </div>
            
            {/* Nav Items */}
            <div className="p-3">
              {navItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group focus-visible-enhanced",
                    activeSection === item.id
                      ? "bg-white/80 dark:bg-white/10 shadow-lg"
                      : "hover:bg-white/50 dark:hover:bg-white/5"
                  )}
                  style={{
                    transitionDelay: mobileOpen ? `${index * 50}ms` : '0ms'
                  }}
                >
                  {/* Icon Container */}
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                      activeSection === item.id ? "shadow-lg" : ""
                    )}
                    style={{ 
                      background: activeSection === item.id 
                        ? `linear-gradient(135deg, ${item.color}, ${item.color}dd)` 
                        : `${item.color}20` 
                    }}
                  >
                    <item.icon 
                      size={22} 
                      className={cn(
                        "transition-colors",
                        activeSection === item.id ? "text-white" : "text-[var(--art-text)]"
                      )} 
                    />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                    <span className={cn(
                      "text-base font-bold block",
                      activeSection === item.id ? "text-[var(--art-text)]" : "text-[var(--art-text-light)]"
                    )}>
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.id === 'events' && 'Browse all events'}
                      {item.id === 'scoreboard' && 'Live team standings'}
                      {item.id === 'results' && 'Event result posters'}
                      {item.id === 'gallery' && 'Photos & memories'}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight 
                    size={18} 
                    className={cn(
                      "text-muted-foreground transition-all duration-300",
                      "group-hover:text-[var(--art-accent)] group-hover:translate-x-1"
                    )} 
                  />
                </a>
              ))}
            </div>
            
            {/* CTA Section */}
            <div className="p-4 pt-0">
              <a
                href="#events"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl text-base font-bold text-white shadow-xl relative overflow-hidden group bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-accent)] to-[var(--art-purple)]"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Sparkles size={18} className="relative z-10" />
                <span className="relative z-10">Explore Events</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-semibold gradient-text">MCAS 2025</span> • Arts & Sports Fest
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
