"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Events", href: "#events" },
    { name: "Scores", href: "#scoreboard" },
    { name: "Gallery", href: "#gallery" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
        "glass-card px-2 py-2 rounded-full",
        scrolled ? "shadow-lg" : ""
      )}
    >
      <div className="flex items-center gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/50 transition-colors">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800">
            <Image
              src="/ibda.png"
              alt="IBDA"
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="text-lg font-bold gradient-text hidden sm:block">MCAS</span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-[var(--art-text-light)] hover:text-[var(--art-text)] hover:bg-white/50 rounded-full transition-all"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <a
          href="#events"
          className="hidden md:flex items-center gap-2 px-5 py-2 btn-pastel-pink rounded-full text-sm font-semibold"
        >
          Explore
        </a>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="md:hidden p-2 rounded-full hover:bg-white/50 transition-colors text-[var(--art-text)]"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm font-medium text-[var(--art-text)] hover:bg-white/50 rounded-xl transition-colors"
            >
              {item.name}
            </a>
          ))}
          <a
            href="#events"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 btn-pastel-pink rounded-xl text-sm font-semibold text-center mt-2"
          >
            Explore Events
          </a>
        </div>
      )}
    </nav>
  )
}
