"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  ArrowRight, Loader2, Calendar, MapPin, Clock, Users, 
  PlayCircle, CheckCircle2, Timer
} from "lucide-react"
import type { DbEvent } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

const categoryColors: Record<string, { bg: string; text: string }> = {
  ART: { bg: "bg-purple-500/10", text: "text-purple-500" },
  SPORTS: { bg: "bg-green-500/10", text: "text-green-500" },
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; class: string }> = {
  upcoming: { icon: Timer, label: "Upcoming", class: "bg-blue-500/10 text-blue-500" },
  ongoing: { icon: PlayCircle, label: "Live Now", class: "bg-green-500/10 text-green-500 animate-pulse" },
  completed: { icon: CheckCircle2, label: "Completed", class: "bg-gray-500/10 text-gray-500" },
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
    <section id="events" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-medium bg-accent/10 text-accent rounded-full mb-4">
            {FEST_CONFIG.dates}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Event Schedule</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {FEST_CONFIG.days} days of thrilling competitions, performances, and celebrations. 
            Find your events and mark your calendar!
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Array.from({ length: FEST_CONFIG.days }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedDay === day
                  ? "bg-accent text-accent-foreground shadow-lg"
                  : "bg-card border border-border hover:bg-secondary"
              }`}
            >
              <span className="block text-xs opacity-70">Day {day}</span>
              <span>{getDayDate(day)}</span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {["ALL", "ART", "SPORTS"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-foreground text-background"
                  : "bg-card border border-border hover:bg-secondary"
              }`}
            >
              {category === "ALL" ? "All Events" : category === "ART" ? "🎨 Arts" : "🏆 Sports"}
            </button>
          ))}
        </div>

        {/* Stage Type Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {["ALL", "on-stage", "off-stage"].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStage === stage
                  ? "bg-accent text-accent-foreground"
                  : "bg-card border border-border hover:bg-secondary"
              }`}
            >
              {stage === "ALL" ? "All Types" : stage === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No events scheduled for this day yet</p>
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
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/50 transition-all duration-300"
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
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-background/50 md:to-transparent`} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                      {/* Time */}
                      <div className="flex-shrink-0 text-center md:text-left md:w-24">
                        <div className="text-2xl font-bold text-accent">{event.time_slot?.split(" ")[0] || "TBA"}</div>
                        <div className="text-xs text-muted-foreground">{event.time_slot?.split(" ")[1] || ""}</div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
                            {event.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            event.stage_type === "on-stage" 
                              ? "bg-amber-500/10 text-amber-500" 
                              : "bg-slate-500/10 text-slate-500"
                          }`}>
                            {event.stage_type === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${status.class}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {event.event_type && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-muted-foreground capitalize">
                              {event.event_type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 truncate">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                        {/* {event.status === "upcoming" && event.registration_open && (
                          <button className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                            Register
                          </button>
                        )} */}
                        <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1">
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
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            Download Full Schedule PDF <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
