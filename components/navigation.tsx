"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
    { name: "Schedule", href: "#events" },
    { name: "Scoreboard", href: "#scoreboard" },
    { name: "Gallery", href: "#gallery" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">MCAS</span>
              <span className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">11</span>
            </Link>
          </div>

          {/* Right Nav - Added Judge Panel link */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/judge"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Judge Panel
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Admin
            </Link>
            <a
              href="#events"
              className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
            >
              Get Tickets
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Added Judge Panel link */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                {item.name}
              </a>
            ))}
            <Link
              href="/judge"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Judge Panel
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
