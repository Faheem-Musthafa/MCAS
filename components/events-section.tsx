"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { 
  ArrowRight, Loader2, Calendar, MapPin, Users, 
  ChevronLeft, ChevronRight, Sparkles, Trophy, Medal, Award, X, Download
} from "lucide-react"
import type { DbEvent, DbTeam, ResultPosition } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  ART: { bg: "rgba(230, 206, 242, 0.7)", text: "var(--foreground)", gradient: "from-[var(--art-pink)] to-[var(--art-purple)]" },
  SPORTS: { bg: "rgba(212, 240, 240, 0.7)", text: "var(--foreground)", gradient: "from-[var(--art-green)] to-[var(--art-blue)]" },
}

// Result type for display
interface EventResult {
  id: string
  position: ResultPosition
  participant_name: string | null
  points: number
  team: DbTeam
}

// Position styling
const POSITION_STYLES: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  "1st": { bg: "bg-gradient-to-r from-yellow-400 to-amber-500", icon: <Trophy className="w-5 h-5" />, label: "1st Place" },
  "2nd": { bg: "bg-gradient-to-r from-slate-300 to-slate-400", icon: <Medal className="w-5 h-5" />, label: "2nd Place" },
  "3rd": { bg: "bg-gradient-to-r from-amber-600 to-amber-700", icon: <Award className="w-5 h-5" />, label: "3rd Place" },
  "participation": { bg: "bg-gradient-to-r from-slate-500 to-slate-600", icon: <Award className="w-5 h-5" />, label: "Participation" },
}


export function EventsSection() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedStage, setSelectedStage] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const EVENTS_PER_PAGE = 3
  
  // Results modal state
  const [selectedEvent, setSelectedEvent] = useState<DbEvent | null>(null)
  const [eventResults, setEventResults] = useState<EventResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [eventPoster, setEventPoster] = useState<string | null>(null)
  const [posterLoading, setPosterLoading] = useState(false)
  
  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedEvent(null)
        setResultsError(null)
      }
    }
    if (selectedEvent || resultsError) {
      document.addEventListener('keydown', onKey)
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedEvent, resultsError])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = (await response.json()) as DbEvent[]
          setEvents(data)
          // Auto-select the first available day
          if (data.length > 0) {
            const days = Array.from(new Set(data.map((e: DbEvent) => e.day))).sort((a, b) => a - b)
            setSelectedDay(days[0] ?? 1)
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

  // Pagination logic
  const totalPages = Math.ceil(sortedEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const endIndex = startIndex + EVENTS_PER_PAGE
  const paginatedEvents = sortedEvents.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDay, selectedCategory, selectedStage])



  return (
    <section id="events" className="relative overflow-hidden bg-gradient-to-b from-transparent via-background/50 to-transparent">
      {/* Floating elements for seamless feel - hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-[350px] h-[350px] rounded-full bg-[var(--art-yellow)]/20 blur-[80px] animate-float-gentle" />
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[var(--art-green)]/20 blur-[80px] animate-float-gentle animation-delay-2000" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm md:text-base font-semibold glass-card rounded-full mb-4 md:mb-5 shadow-lg text-foreground">
            <Calendar size={14} className="text-[var(--art-accent)]" />
            Event Schedule
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-3 md:mb-4 leading-tight">
            Event <span className="gradient-text">Schedule</span>
          </h2>
          <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Discover exciting events across arts and sports categories
          </p>
        </div>

        {/* Day Filter - Dynamic - scrollable on mobile */}
        {availableDays.length > 0 && (
          <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-2 mb-5 md:mb-6 -mx-4 px-4 md:mx-0 md:px-0 pb-2">
            {availableDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-bold transition-all duration-300 touch-feedback btn-readable ${
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

        {/* Category Filter - scrollable on mobile */}
        <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-2 md:gap-3 mb-4 -mx-4 px-4 md:mx-0 md:px-0 pb-2">
          {[
            { key: "ALL", label: "All Events", emoji: "✨" },
            { key: "ART", label: "Arts", emoji: "🎨" },
            { key: "SPORTS", label: "Sports", emoji: "🏆" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 group relative px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-xs md:text-sm font-bold transition-all duration-300 overflow-hidden touch-feedback ${
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
              <span className="relative flex items-center gap-1.5 md:gap-2">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Stage Type Filter - scrollable on mobile */}
        <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-2 md:gap-3 mb-8 md:mb-10 -mx-4 px-4 md:mx-0 md:px-0 pb-2">
          {[
            { key: "ALL", label: "All Types", emoji: "🌟" },
            { key: "on-stage", label: "On-Stage", emoji: "🎤" },
            { key: "off-stage", label: "Off-Stage", emoji: "📝" },
          ].map((stage) => (
            <button
              key={stage.key}
              onClick={() => setSelectedStage(stage.key)}
              className={`flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 touch-feedback ${
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
          <div className="space-y-4 md:space-y-5">
            {paginatedEvents.map((event, index) => {
              const categoryStyle = categoryColors[event.category] || categoryColors.ART
              
              return (
                <div
                  key={event.id}
                  className="group glass-card rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slide-up touch-feedback"
                  style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
                >

                  <div className="flex flex-col md:flex-row">
                    {/* Image - smaller on mobile */}
                    {event.image && (
                      <div className="relative w-full md:w-56 h-36 md:h-auto flex-shrink-0 overflow-hidden img-zoom">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {/* Badges - scrollable on mobile */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <span 
                            className="px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-full shadow-sm"
                            style={{ background: categoryStyle.bg, color: categoryStyle.text }}
                          >
                            {event.category === "ART" ? "🎨" : "🏆"} {event.category}
                          </span>
                          <span 
                            className="px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium rounded-full shadow-sm"
                            style={{ 
                              background: event.stage_type === "on-stage" 
                                ? 'rgba(255, 245, 186, 0.9)' 
                                : 'rgba(193, 225, 255, 0.9)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {event.stage_type === "on-stage" ? "🎤" : "📝"} <span className="hidden sm:inline">{event.stage_type === "on-stage" ? "On-Stage" : "Off-Stage"}</span>
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2 text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-1">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[var(--art-accent)]" /> {event.venue}
                          </span>
                          {event.participant_limit && (
                            <span className="hidden sm:flex items-center gap-1">
                              <Users size={12} className="text-[var(--art-accent)]" /> {event.participant_limit} max
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 md:gap-3 md:flex-shrink-0 mt-2 md:mt-0">
                        <button
                          onClick={async () => {
                            // Fetch results for this event
                            setResultsError(null)
                            setResultsLoading(true)
                            setSelectedEvent(event)
                            setEventPoster(null)
                            try {
                              // Fetch results and poster in parallel
                              const [resultsRes, postersRes] = await Promise.all([
                                fetch(`/api/results?event_id=${event.id}`),
                                fetch('/api/posters')
                              ])
                              
                              // Handle results
                              if (resultsRes.ok) {
                                const data = await resultsRes.json()
                                if (Array.isArray(data) && data.length > 0) {
                                  const sorted = data.sort((a: any, b: any) => {
                                    const order: Record<string, number> = { "1st": 0, "2nd": 1, "3rd": 2, "participation": 3 }
                                    return (order[a.position] || 4) - (order[b.position] || 4)
                                  })
                                  setEventResults(sorted)
                                } else {
                                  setEventResults([])
                                  setResultsError('No results available for this event yet')
                                }
                              }
                              
                              // Handle poster
                              if (postersRes.ok) {
                                const postersData = await postersRes.json()
                                const found = Array.isArray(postersData) 
                                  ? postersData.find((p: any) => (p.event && p.event.id === event.id) || p.event_id === event.id) 
                                  : null
                                if (found) {
                                  setEventPoster(found.src)
                                }
                              }
                            } catch (e) {
                              console.error(e)
                              setResultsError('Failed to load results')
                              setEventResults([])
                            } finally {
                              setResultsLoading(false)
                            }
                          }}
                          className="group/btn flex-1 md:flex-none relative px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 lg:hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, var(--art-blue), var(--art-green))' }}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          <span className="relative flex items-center justify-center gap-1.5 md:gap-2 text-foreground">
                            {resultsLoading && selectedEvent?.id === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Results <Trophy size={12} /></>}
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

        {/* Pagination Controls */}
        {!loading && sortedEvents.length > EVENTS_PER_PAGE && (
          <div className="flex items-center justify-center gap-3 mt-8 md:mt-10">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 md:p-3 rounded-xl glass-card hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[var(--art-pink)] to-[var(--art-purple)] text-white shadow-lg"
                      : "glass-card hover:shadow-md text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 md:p-3 rounded-xl glass-card hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>
        )}

        {/* Events count indicator */}
        {!loading && sortedEvents.length > 0 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedEvents.length)} of {sortedEvents.length} events
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

      {/* Results Modal (portal) */}
      {typeof document !== 'undefined' && (selectedEvent || resultsError) && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/70 p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedEvent?.title || 'Event Results'}
          onClick={() => { setSelectedEvent(null); setResultsError(null); setEventResults([]); setEventPoster(null) }}
        >
          <div className="w-full md:w-auto md:max-w-lg md:min-w-[400px] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Results Card */}
            <div className="relative w-full bg-card md:rounded-xl rounded-t-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-border bg-gradient-to-r from-[var(--art-pink)]/20 to-[var(--art-purple)]/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-1">{selectedEvent?.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ 
                        background: selectedEvent?.category === 'ART' ? 'rgba(230, 206, 242, 0.7)' : 'rgba(212, 240, 240, 0.7)' 
                      }}>
                        {selectedEvent?.category === 'ART' ? '🎨 Arts' : '🏆 Sports'}
                      </span>
                      {selectedEvent?.venue && <span>📍 {selectedEvent.venue}</span>}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedEvent(null); setResultsError(null); setEventResults([]); setEventPoster(null) }} 
                    className="p-2 rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Results List */}
              <div className="p-4 md:p-5 max-h-[60vh] overflow-y-auto">
                {resultsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--art-accent)]" />
                    <p className="mt-3 text-muted-foreground">Loading results...</p>
                  </div>
                ) : resultsError ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">{resultsError}</p>
                  </div>
                ) : eventResults.length > 0 ? (
                  <div className="space-y-3">
                    {eventResults.map((result) => {
                      const style = POSITION_STYLES[result.position] || POSITION_STYLES["participation"]
                      return (
                        <div key={result.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          {/* Position Badge */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-white shadow-lg`}>
                            {style.icon}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground line-clamp-1">
                              {result.participant_name || result.team?.name || 'Team Entry'}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {result.team?.name} • {style.label}
                            </p>
                          </div>
                          
                          {/* Points */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-lg font-bold text-[var(--art-accent)]">+{result.points}</span>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No results yet</p>
                  </div>
                )}
              </div>

              {/* Footer with Download Button */}
              {eventPoster && !resultsLoading && (
                <div className="p-4 border-t border-border bg-secondary/20">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(eventPoster)
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${selectedEvent?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'poster'}.png`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                      } catch (err) {
                        console.error('Download failed:', err)
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--art-pink)] to-[var(--art-purple)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Download size={18} />
                    Download Result Poster
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
