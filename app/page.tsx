import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { EventsSection } from "@/components/events-section"
import { ScoreboardSection } from "@/components/scoreboard-section"
import { GallerySection } from "@/components/gallery-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <EventsSection />
      <ScoreboardSection />
      <GallerySection />
      <Footer />
    </main>
  )
}
