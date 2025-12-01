"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Art Exhibition",
    venue: "Gallery Hall",
    date: "DEC 15-16",
    category: "ART",
    image: "/art-exhibition-gallery-colorful-paintings.jpg",
    color: "from-amber-500/20",
  },
  {
    id: 2,
    title: "Football Championship",
    venue: "Sports Complex",
    date: "DEC 17",
    category: "SPORTS",
    image: "/football-match-stadium-night-lights.jpg",
    color: "from-emerald-500/20",
  },
  {
    id: 3,
    title: "Music Performance",
    venue: "Auditorium",
    date: "DEC 18",
    category: "ART",
    image: "/concert-stage-lights.png",
    color: "from-blue-500/20",
  },
  {
    id: 4,
    title: "Basketball Finals",
    venue: "Indoor Stadium",
    date: "DEC 19-20",
    category: "SPORTS",
    image: "/basketball-game-indoor-court-action.jpg",
    color: "from-orange-500/20",
  },
]

export function EventsSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section id="events" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">2025 Events</h2>
            <p className="mt-2 text-muted-foreground">Experience the best of art and sports</p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View Full Schedule <ArrowRight size={16} />
          </a>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-500 hover:border-accent/50"
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    hoveredId === event.id ? "scale-110 grayscale-0" : "scale-100 grayscale"
                  }`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${event.color} to-transparent opacity-60`} />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{event.date}</div>
                <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.venue}</p>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                    Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
