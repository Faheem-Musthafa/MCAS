"use client"

import { useState, useEffect } from "react"
import { LaunchScreen } from "@/components/launch-screen"
import { Confetti } from "@/components/confetti"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { EventsSection } from "@/components/events-section"
import { ScoreboardSection } from "@/components/scoreboard-section"
import { PostersSection } from "@/components/posters-section"
import { GallerySection } from "@/components/gallery-section"
import { Footer } from "@/components/footer"

export function HomePage() {
  const [launched, setLaunched] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Check if user has already launched (session storage)
    const hasLaunched = sessionStorage.getItem("mcas-launched")
    if (hasLaunched) {
      setLaunched(true)
      setShowContent(true)
    }
  }, [])

  const handleLaunch = () => {
    setLaunched(true)
    sessionStorage.setItem("mcas-launched", "true")
    // Delay showing content for smooth transition
    setTimeout(() => {
      setShowContent(true)
      // Trigger confetti after content appears
      setTimeout(() => {
        setShowConfetti(true)
        // Auto-hide confetti after animation
        setTimeout(() => setShowConfetti(false), 5000)
      }, 300)
    }, 100)
  }

  return (
    <>
      {/* Launch Screen */}
      {!launched && <LaunchScreen onLaunch={handleLaunch} />}

      {/* Confetti celebration effect */}
      <Confetti isActive={showConfetti} duration={4500} particleCount={100} />

      {/* Main Content */}
      <main 
        className={`min-h-screen relative overflow-hidden transition-all duration-700 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Global Seamless Background */}
        <div className="fixed inset-0 -z-10">
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--art-cream)] via-[var(--art-blue)]/20 to-[var(--art-pink)]/20 dark:from-[#1a1a2e] dark:via-[#2a2a4e] dark:to-[#1a1a2e]" />
          
          {/* Animated Blobs for Arts & Sports Vibe */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--art-purple)]/30 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen dark:opacity-20" />
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--art-green)]/30 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen dark:opacity-20" />
          <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[var(--art-blue)]/30 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen dark:opacity-20" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        </div>
        
        <Navigation />
        
        <div className="relative z-10 space-y-0">
          <HeroSection />
          <EventsSection />
          <ScoreboardSection />
          <PostersSection />
          <GallerySection />
        </div>
        
        <Footer />
      </main>
    </>
  )
}
