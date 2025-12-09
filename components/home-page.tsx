"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { EventsSection } from "@/components/events-section"
import { ScoreboardSection } from "@/components/scoreboard-section"
import { PostersSection } from "@/components/posters-section"
import { GallerySection } from "@/components/gallery-section"
import { Footer } from "@/components/footer"

export function HomePage() {
  return (
    <>
      {/* Main Content */}
      <main className="min-h-screen relative overflow-hidden">
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
        
        <div className="relative z-10 seamless-sections">
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
