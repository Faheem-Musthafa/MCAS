"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  ArrowRight, Loader2, Calendar, MapPin, Users, 
  PlayCircle, CheckCircle2, Timer, Sparkles
} from "lucide-react"
import type { DbEvent } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  ART: { bg: "rgba(230, 206, 242, 0.7)", text: "var(--foreground)", gradient: "from-[var(--art-pink)] to-[var(--art-purple)]" },
  SPORTS: { bg: "rgba(212, 240, 240, 0.7)", text: "var(--foreground)", gradient: "from-[var(--art-green)] to-[var(--art-blue)]" },
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; bg: string; pulse?: boolean }> = {
  upcoming: { icon: Timer, label: "Upcoming", bg: "rgba(193, 225, 255, 0.8)" },
  ongoing: { icon: PlayCircle, label: "Live Now", bg: "rgba(255, 143, 171, 0.9)", pulse: true },
  completed: { icon: CheckCircle2, label: "Completed", bg: "rgba(212, 240, 240, 0.8)" },
}

export function EventsSection() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedStage, setSelectedStage] = useState<string>("ALL")

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
          // Auto-select the first available day
          if (data.length > 0) {
            const days = [...new Set(data.map((e: DbEvent) => e.day))].sort((a, b) => a - b)
            setSelectedDay(days[0] || 1)
          } else {
            setSelectedDay(1)
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Get unique days from events
  const availableDays = [...new Set(events.map(e => e.day))].sort((a, b) => a - b)

  // Filter events by day, category, and stage type
  const filteredEvents = events.filter(event => {
    const dayMatch = selectedDay === null || event.day === selectedDay
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



  return (
    <section id="events" className="py-24 px-6 relative overflow-hidden bg-transparent">
      {/* Floating elements for seamless feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-[350px] h-[350px] rounded-full bg-[var(--art-yellow)]/20 blur-[80px] animate-float-gentle" />
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[var(--art-green)]/20 blur-[80px] animate-float-gentle animation-delay-2000" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold glass-card rounded-full mb-5 shadow-lg">
            <Calendar size={16} className="text-[var(--art-accent)]" />
            Event Schedule
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-3">
            Event <span className="gradient-text">Schedule</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover exciting events across arts and sports categories
          </p>
        </div>

        {/* Day Filter - Dynamic */}
        {availableDays.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {availableDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedDay === day
                    ? "bg-gradient-to-r from-[var(--art-pink)] to-[var(--art-purple)] text-white shadow-lg"
                    : "glass-card hover:bg-white/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {[
            { key: "ALL", label: "All Events", emoji: "✨" },
            { key: "ART", label: "Arts", emoji: "🎨" },
            { key: "SPORTS", label: "Sports", emoji: "🏆" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                selectedCategory === cat.key
                  ? "text-foreground shadow-lg"
                  : "glass-card hover:shadow-md text-muted-foreground hover:text-foreground"
              }`}
              style={{ 
                background: selectedCategory === cat.key 
                  ? cat.key === "ART" 
                    ? 'linear-gradient(135deg, rgba(255, 209, 220, 0.9), rgba(230, 206, 242, 0.9))'
                    : cat.key === "SPORTS"
                    ? 'linear-gradient(135deg, rgba(212, 240, 240, 0.9), rgba(193, 225, 255, 0.9))'
                    : 'linear-gradient(135deg, rgba(255, 143, 171, 0.9), rgba(230, 206, 242, 0.9))'
                  : undefined 
              }}
            >
              <span className="relative flex items-center gap-2">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Stage Type Filter */}
        <div className="flex justify-center gap-3 mb-10">
          {[
            { key: "ALL", label: "All Types", emoji: "🌟" },
            { key: "on-stage", label: "On-Stage", emoji: "🎤" },
            { key: "off-stage", label: "Off-Stage", emoji: "📝" },
          ].map((stage) => (
            <button
              key={stage.key}
              onClick={() => setSelectedStage(stage.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedStage === stage.key
                  ? "bg-gradient-to-r from-[var(--art-blue)] to-[var(--art-green)] text-foreground shadow-md"
                  : "glass-card hover:bg-white/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {stage.emoji} {stage.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--art-pink)] to-[var(--art-purple)] blur-xl opacity-50 animate-pulse" />
              <Loader2 className="relative w-12 h-12 animate-spin text-[var(--art-accent)]" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(230, 206, 242, 0.5)' }}>
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Events Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {selectedDay ? `No events scheduled for Day ${selectedDay} with the selected filters.` : 'No events available.'} Try a different combination!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedEvents.map((event, index) => {
              const status = statusConfig[event.status] || statusConfig.upcoming
              const StatusIcon = status.icon
              const categoryStyle = categoryColors[event.category] || categoryColors.ART
              
              return (
                <div
                  key={event.id}
                  className="group glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Live indicator bar */}
                  {event.status === 'ongoing' && (
                    <div className="h-1 bg-gradient-to-r from-[var(--art-pink)] via-[var(--art-accent)] to-[var(--art-pink)] animate-shimmer" />
                  )}

                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {event.image && (
                      <div className="relative w-full md:w-56 h-44 md:h-auto flex-shrink-0 overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-5">
                      {/* Time */}
                      <div className="flex-shrink-0 text-center md:text-left md:w-28">
                        <div className="text-3xl font-black gradient-text tracking-tight">{event.time_slot?.split(" ")[0] || "TBA"}</div>
                        <div className="text-xs text-muted-foreground font-medium">{event.time_slot?.split(" ")[1] || ""}</div>
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span 
                            className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm"
                            style={{ background: categoryStyle.bg, color: categoryStyle.text }}
                          >
                            {event.category === "ART" ? "🎨" : "🏆"} {event.category}
                          </span>
                          <span 
                            className="px-3 py-1.5 text-xs font-medium rounded-full shadow-sm"
                            style={{ 
                              background: event.stage_type === "on-stage" 
                                ? 'rgba(255, 245, 186, 0.9)' 
                                : 'rgba(193, 225, 255, 0.9)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {event.stage_type === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
                          </span>
                          <span 
                            className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm ${status.pulse ? 'animate-pulse' : ''}`}
                            style={{ background: status.bg, color: 'var(--foreground)' }}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {event.event_type && (
                            <span className="px-3 py-1.5 text-xs font-medium rounded-full capitalize shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.7)' }}>
                              {event.event_type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:gradient-text transition-all duration-300">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-[var(--art-accent)]" /> {event.venue}
                          </span>
                          {event.participant_limit && (
                            <span className="flex items-center gap-1.5">
                              <Users size={14} className="text-[var(--art-accent)]" /> {event.participant_limit} participants
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 md:flex-shrink-0">
                        <button className="group/btn relative px-6 py-3 text-sm font-bold rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--art-blue), var(--art-green))' }}>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          <span className="relative flex items-center gap-2 text-foreground">
                            Details <ArrowRight size={14} />
                          </span>
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
        <div className="text-center mt-12">
          <a
            href="#scoreboard"
            className="group inline-flex items-center gap-3 px-8 py-4 glass-card rounded-full text-sm font-bold text-foreground hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles size={18} className="text-[var(--art-accent)]" />
            View Live Scores
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
