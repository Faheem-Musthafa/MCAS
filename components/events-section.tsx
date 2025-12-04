"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  ArrowRight, Loader2, Calendar, MapPin, Users, 
  PlayCircle, CheckCircle2, Timer
} from "lucide-react"
import type { DbEvent } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

const categoryColors: Record<string, { bg: string; text: string }> = {
  ART: { bg: "rgba(230, 206, 242, 0.7)", text: "var(--art-text)" },
  SPORTS: { bg: "rgba(212, 240, 240, 0.7)", text: "var(--art-text)" },
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; bg: string }> = {
  upcoming: { icon: Timer, label: "Upcoming", bg: "rgba(193, 225, 255, 0.7)" },
  ongoing: { icon: PlayCircle, label: "Live Now", bg: "rgba(255, 143, 171, 0.7)" },
  completed: { icon: CheckCircle2, label: "Completed", bg: "rgba(212, 240, 240, 0.7)" },
}

export function EventsSection() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedStage, setSelectedStage] = useState<string>("ALL")

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Filter events by day, category, and stage type
  const filteredEvents = events.filter(event => {
    const dayMatch = event.day === selectedDay
    const categoryMatch = selectedCategory === "ALL" || event.category === selectedCategory
    const stageMatch = selectedStage === "ALL" || event.stage_type === selectedStage
    return dayMatch && categoryMatch && stageMatch
  })

  // Sort by time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const timeA = a.time_slot || "00:00"
    const timeB = b.time_slot || "00:00"
    return timeA.localeCompare(timeB)
  })

  // Get day dates
  const getDayDate = (day: number) => {
    const startDate = new Date("2025-12-15")
    startDate.setDate(startDate.getDate() + day - 1)
    return startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <section id="events" className="py-24 px-6 relative overflow-hidden">
      {/* Pastel background */}
      <div className="absolute inset-0 bg-radial-pastel" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-yellow absolute top-20 -right-20 w-[300px] h-[300px] opacity-30" style={{ animationDelay: '0s' }} />
        <div className="blob blob-green absolute bottom-20 -left-20 w-[250px] h-[250px] opacity-30" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium glass-card rounded-full mb-4">
            <Calendar size={16} className="text-[var(--art-accent)]" />
            {FEST_CONFIG.dates}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--art-text)]">Event Schedule</h2>
          </div>

        {/* Day Tabs */}
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              selectedCategory === "ALL"
                ? "btn-pastel-pink"
                : "glass-card hover:bg-white/70"
            }`}
          >
            ✨ All Events
          </button>
          <button
            onClick={() => setSelectedCategory("ART")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              selectedCategory === "ART"
                ? "text-[var(--art-text)]"
                : "glass-card hover:bg-white/70"
            }`}
            style={{ background: selectedCategory === "ART" ? 'rgba(230, 206, 242, 0.9)' : undefined }}
          >
            🎨 Arts
          </button>
          <button
            onClick={() => setSelectedCategory("SPORTS")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              selectedCategory === "SPORTS"
                ? "text-[var(--art-text)]"
                : "glass-card hover:bg-white/70"
            }`}
            style={{ background: selectedCategory === "SPORTS" ? 'rgba(212, 240, 240, 0.9)' : undefined }}
          >
            🏆 Sports
          </button>
        </div>

        {/* Stage Type Filter */}
        <div className="flex justify-center gap-3 mb-8">
          {["ALL", "on-stage", "off-stage"].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                selectedStage === stage
                  ? "btn-pastel-blue"
                  : "glass-card hover:bg-white/70"
              }`}
            >
              {stage === "ALL" ? "🌟 All Types" : stage === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--art-accent)]" />
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-3xl">
            <Calendar className="w-12 h-12 mx-auto text-[var(--art-text-light)] mb-4" />
            <p className="text-[var(--art-text-light)]">No events scheduled for this day yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const status = statusConfig[event.status] || statusConfig.upcoming
              const StatusIcon = status.icon
              const categoryStyle = categoryColors[event.category] || categoryColors.ART
              
              return (
                <div
                  key={event.id}
                  className="group glass-card rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {event.image && (
                      <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                      {/* Time */}
                      <div className="flex-shrink-0 text-center md:text-left md:w-24">
                        <div className="text-2xl font-bold gradient-text">{event.time_slot?.split(" ")[0] || "TBA"}</div>
                        <div className="text-xs text-[var(--art-text-light)]">{event.time_slot?.split(" ")[1] || ""}</div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span 
                            className="px-2.5 py-1 text-xs font-semibold rounded-full"
                            style={{ background: categoryStyle.bg, color: categoryStyle.text }}
                          >
                            {event.category === "ART" ? "🎨" : "🏆"} {event.category}
                          </span>
                          <span 
                            className="px-2.5 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              background: event.stage_type === "on-stage" 
                                ? 'rgba(255, 245, 186, 0.8)' 
                                : 'rgba(193, 225, 255, 0.8)',
                              color: 'var(--art-text)'
                            }}
                          >
                            {event.stage_type === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
                          </span>
                          <span 
                            className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${event.status === 'ongoing' ? 'animate-pulse' : ''}`}
                            style={{ background: status.bg, color: 'var(--art-text)' }}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {event.event_type && (
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full capitalize" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                              {event.event_type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 truncate text-[var(--art-text)]">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--art-text-light)]">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {event.venue}
                          </span>
                          {event.participant_limit && (
                            <span className="flex items-center gap-1">
                              <Users size={14} /> {event.participant_limit} participants
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 md:flex-shrink-0">
                        <button className="px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-1 btn-pastel-blue">
                          Details <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--art-accent)] hover:underline"
          >
            Download Full Schedule PDF <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
