"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2, Trophy, Medal, Trash2, Award, Check, RefreshCw, Plus, Sparkles, ChevronDown, Users, User, Image } from "lucide-react"
import type { DbEvent, DbTeam, DbResultWithTeam, ResultPosition } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"
import { ResultPoster, type PosterData } from "./result-poster"

const POSITIONS: { value: ResultPosition; label: string; icon: string; color: string; gradient: string }[] = [
  { value: "1st", label: "1st Place", icon: "🥇", color: "text-yellow-500 bg-yellow-500/10", gradient: "from-yellow-500/20 to-amber-500/20" },
  { value: "2nd", label: "2nd Place", icon: "🥈", color: "text-gray-400 bg-gray-500/10", gradient: "from-slate-400/20 to-gray-500/20" },
  { value: "3rd", label: "3rd Place", icon: "🥉", color: "text-orange-500 bg-orange-500/10", gradient: "from-orange-500/20 to-amber-600/20" },
]

interface ParticipantEntry {
  id: string
  participant_name: string
  position: ResultPosition
  team_id: string
}

export function ResultsManager() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [results, setResults] = useState<DbResultWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [filterCompleted, setFilterCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected event for adding results
  const [eventForResults, setEventForResults] = useState<string>("")
  const [eventType, setEventType] = useState<"individual" | "group">("individual")
  
  // Multiple participants entry
  const [participants, setParticipants] = useState<ParticipantEntry[]>([
    { id: crypto.randomUUID(), participant_name: "", position: "1st", team_id: "" },
  ])
  
  // Poster state
  const [showPoster, setShowPoster] = useState(false)
  const [posterData, setPosterData] = useState<PosterData | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      }
      setError(null)

      const [eventsRes, teamsRes, resultsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/teams"),
        fetch("/api/results"),
      ])

      if (!eventsRes.ok) throw new Error("Failed to fetch events")
      if (!teamsRes.ok) throw new Error("Failed to fetch teams")
      if (!resultsRes.ok) throw new Error("Failed to fetch results")

      const eventsData = await eventsRes.json()
      const teamsData = await teamsRes.json()
      const resultsData = await resultsRes.json()

      setEvents(eventsData)
      setTeams(teamsData)
      setResults(resultsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh for real-time updates
    const interval = setInterval(() => fetchData(true), FEST_CONFIG.refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData])

  // Update event type when event changes
  useEffect(() => {
    if (eventForResults) {
      const event = events.find(e => e.id === eventForResults)
      if (event) {
        setEventType(event.event_type === "group" || event.event_type === "team" ? "group" : "individual")
      }
    }
  }, [eventForResults, events])

  // Track which events have results published
  const eventsWithResults = useMemo(() => {
    const eventIds = new Set<string>()
    results.forEach(r => eventIds.add(r.event_id))
    return eventIds
  }, [results])

  const calculatePoints = (position: ResultPosition, eventId?: string) => {
    if (!eventId) return 0
    const event = events.find(e => e.id === eventId)
    if (!event) return 0
    
    const category = event.category // ART or SPORTS
    const type = (event.event_type === "group" || event.event_type === "team") ? "group" : "individual"
    const scoringConfig = FEST_CONFIG.scoring[category][type]
    return scoringConfig[position as keyof typeof scoringConfig] || 0
  }

  const addParticipantRow = () => {
    setParticipants([
      ...participants,
      { id: crypto.randomUUID(), participant_name: "", position: "1st", team_id: "" },
    ])
  }

  const updateParticipant = (id: string, field: keyof ParticipantEntry, value: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const handleSaveAllResults = async (generatePoster = false) => {
    if (!eventForResults) {
      alert("Please select an event first")
      return
    }

    const validParticipants = participants.filter(p => p.participant_name && p.team_id)
    if (validParticipants.length === 0) {
      alert("Please add at least one participant with name and team")
      return
    }

    setSaving(true)
    try {
      const createdResults: DbResultWithTeam[] = []
      
      for (const participant of validParticipants) {
        const points = calculatePoints(participant.position, eventForResults)
        
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventForResults,
            team_id: participant.team_id,
            position: participant.position,
            participant_name: participant.participant_name,
            points,
            notes: eventType
          }),
        })

        if (res.ok) {
          const created = await res.json()
          createdResults.push(created)
        }
      }

      if (createdResults.length > 0) {
        setResults([...createdResults, ...results])
        
        // Refresh teams to get updated points
        const teamsRes = await fetch("/api/teams")
        if (teamsRes.ok) setTeams(await teamsRes.json())
        
        // Generate poster if requested
        if (generatePoster) {
          const event = events.find(e => e.id === eventForResults)
          if (event) {
            const posterResults = validParticipants.map(p => {
              const team = teams.find(t => t.id === p.team_id)
              return {
                position: p.position,
                participant_name: p.participant_name,
                team: team!,
                points: calculatePoints(p.position, eventForResults)
              }
            })
            
            setPosterData({
              event: event,
              results: posterResults
            })
            setShowPoster(true)
          }
        }
        
        // Reset form
        setParticipants([
          { id: crypto.randomUUID(), participant_name: "", position: "1st", team_id: "" },
        ])
      }
    } catch (error) {
      console.error("Failed to add results:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResult = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result? Points will be deducted from the team.")) return

    try {
      const res = await fetch(`/api/results/${id}`, { method: "DELETE" })
      if (res.ok) {
        // Remove from local state
        const deletedResult = results.find(r => r.id === id)
        setResults(results.filter(r => r.id !== id))
        
        // Update team points locally if possible, or just refresh teams
        if (deletedResult) {
          const team = teams.find(t => t.id === deletedResult.team_id)
          if (team) {
            // Refresh teams to get accurate points
            const teamsRes = await fetch("/api/teams")
            if (teamsRes.ok) setTeams(await teamsRes.json())
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete result:", error)
    }
  }

  const handleDeleteEverything = async () => {
    if (!confirm("⚠️ DELETE ALL RESULTS?\n\nThis will permanently delete:\n• All Results from all events\n• Reset all team points to 0\n\nEvents will remain intact.\nThis action cannot be undone!")) return

    try {
      // Delete all results
      const deletePromises = results.map(result => 
        fetch(`/api/results/${result.id}`, { method: "DELETE" })
      )
      
      await Promise.all(deletePromises)
      
      // Clear results state
      setResults([])
      setEventForResults("")
      setParticipants([
        { id: crypto.randomUUID(), participant_name: "", position: "1st", team_id: "" },
      ])
      
      // Reset all team points to 0
      const resetTeamPromises = teams.map(team => 
        fetch(`/api/teams/${team.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_points: 0,
            gold: 0,
            silver: 0,
            bronze: 0
          })
        })
      )
      
      await Promise.all(resetTeamPromises)
      
      // Refresh teams to show updated points
      const teamsRes = await fetch("/api/teams")
      if (teamsRes.ok) setTeams(await teamsRes.json())
      
      alert("✅ All results have been deleted successfully! Events remain intact.")
    } catch (error) {
      console.error("Failed to delete all results:", error)
      alert("❌ Failed to delete all results. Please try again.")
    }
  }

  const getTeam = (id: string) => teams.find(t => t.id === id)
  const getEvent = (id: string) => events.find(e => e.id === id)

  // Group results by event
  const resultsByEvent = results.reduce((acc, result) => {
    const eventId = result.event_id
    if (!acc[eventId]) acc[eventId] = []
    acc[eventId].push(result)
    return acc
  }, {} as Record<string, DbResultWithTeam[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Add Results Form */}
      <div className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-secondary/30 rounded-2xl border border-border shadow-lg space-y-6">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-accent to-accent/70 rounded-xl shadow-lg shadow-accent/20">
              <Award size={22} className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2">
                Record Event Results
                <Sparkles size={16} className="text-accent" />
              </h3>
              <p className="text-sm text-muted-foreground">Add participants and their achievements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Refresh data"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleDeleteEverything}
              className="p-2.5 text-destructive hover:text-white hover:bg-destructive rounded-xl transition-all hover:scale-105 active:scale-95 border border-destructive/30 hover:border-destructive"
              title="Delete everything"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Event Selection */}
        <div className="relative grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy size={14} className="text-accent" />
              Select Event
            </label>
            <div className="relative">
              <select
                value={eventForResults}
                onChange={(e) => setEventForResults(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 backdrop-blur rounded-xl border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Choose an event ({events.length} available)</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {eventsWithResults.has(event.id) ? "✓ " : ""}{event.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">✓ = Results already published</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users size={14} className="text-accent" />
              Event Type (Auto-detected)
            </label>
            <div className="flex p-1.5 bg-secondary/50 backdrop-blur rounded-xl border border-border">
              <div
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  eventType === "individual"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                <User size={16} />
                Individual
                <span className="text-xs opacity-70">(ART: 5/3/1, SPORTS: 5/3/1)</span>
              </div>
              <div
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  eventType === "group"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                <Users size={16} />
                Group/Team
                <span className="text-xs opacity-70">(ART: 10/5/3, SPORTS: 10/5/3)</span>
              </div>
            </div>
            {!eventForResults && (
              <p className="text-xs text-muted-foreground italic">Select an event to auto-detect type</p>
            )}
          </div>
        </div>

        {/* Participants Table */}
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Medal size={14} className="text-accent" />
              Participants ({participants.length})
            </label>
            <button
              onClick={addParticipantRow}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Add Participant
            </button>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-secondary to-secondary/50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participant Name</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants.map((participant, index) => {
                  const posConfig = POSITIONS.find(p => p.value === participant.position)
                  return (
                    <tr 
                      key={participant.id} 
                      className={`bg-gradient-to-r ${posConfig?.gradient || ''} hover:brightness-95 transition-all animate-in fade-in slide-in-from-left-2`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder="Enter participant name"
                          value={participant.participant_name}
                          onChange={(e) => updateParticipant(participant.id, "participant_name", e.target.value)}
                          className="w-full px-4 py-2.5 bg-background/50 backdrop-blur rounded-xl border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={participant.position}
                            onChange={(e) => updateParticipant(participant.id, "position", e.target.value)}
                            className="w-full px-4 py-2.5 bg-background/50 backdrop-blur rounded-xl border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all appearance-none cursor-pointer"
                          >
                            {POSITIONS.map((pos) => (
                              <option key={pos.value} value={pos.value}>
                                {pos.icon} {pos.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={participant.team_id}
                            onChange={(e) => updateParticipant(participant.id, "team_id", e.target.value)}
                            className="w-full px-4 py-2.5 bg-background/50 backdrop-blur rounded-xl border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name} ({team.short_name})
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 text-lg font-bold text-accent bg-accent/10 rounded-xl shadow-inner">
                          +{calculatePoints(participant.position, eventForResults)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSaveAllResults(false)}
            disabled={saving || !eventForResults || participants.every(p => !p.participant_name || !p.team_id)}
            className="flex-1 py-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-border hover:border-accent/30"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            Save Results Only
          </button>
          <button
            onClick={() => handleSaveAllResults(true)}
            disabled={saving || !eventForResults || participants.every(p => !p.participant_name || !p.team_id)}
            className="flex-1 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.01] active:scale-[0.99] overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Image size={20} />}
            Save & Generate Poster
          </button>
        </div>

        {/* Scoring Rules Info */}
        <div className="relative p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur rounded-2xl border border-border overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            Scoring Rules
          </h4>
          <div className="relative grid grid-cols-2 gap-6">
            <div className="p-4 bg-background/30 rounded-xl">
              <span className="font-semibold text-foreground flex items-center gap-2 mb-3">
                🎨 ART Events
              </span>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">Group Events:</div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-yellow-500/10 rounded-lg">
                  <span>🥇 1st</span>
                  <span className="font-bold text-yellow-500">{FEST_CONFIG.scoring.ART.group["1st"]} pts</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-500/10 rounded-lg">
                  <span>🥈 2nd</span>
                  <span className="font-bold text-gray-400">{FEST_CONFIG.scoring.ART.group["2nd"]} pts</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-orange-500/10 rounded-lg">
                  <span>🥉 3rd</span>
                  <span className="font-bold text-orange-500">{FEST_CONFIG.scoring.ART.group["3rd"]} pts</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3 mb-1">Individual Events:</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-center py-1 px-2 bg-yellow-500/10 rounded text-xs">
                    <div className="text-yellow-500 font-bold">{FEST_CONFIG.scoring.ART.individual["1st"]}</div>
                  </div>
                  <div className="text-center py-1 px-2 bg-gray-500/10 rounded text-xs">
                    <div className="text-gray-400 font-bold">{FEST_CONFIG.scoring.ART.individual["2nd"]}</div>
                  </div>
                  <div className="text-center py-1 px-2 bg-orange-500/10 rounded text-xs">
                    <div className="text-orange-500 font-bold">{FEST_CONFIG.scoring.ART.individual["3rd"]}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-background/30 rounded-xl">
              <span className="font-semibold text-foreground flex items-center gap-2 mb-3">
                ⚽ SPORTS Events
              </span>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">Group Events:</div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-yellow-500/10 rounded-lg">
                  <span>🥇 1st</span>
                  <span className="font-bold text-yellow-500">{FEST_CONFIG.scoring.SPORTS.group["1st"]} pts</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-500/10 rounded-lg">
                  <span>🥈 2nd</span>
                  <span className="font-bold text-gray-400">{FEST_CONFIG.scoring.SPORTS.group["2nd"]} pts</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-orange-500/10 rounded-lg">
                  <span>🥉 3rd</span>
                  <span className="font-bold text-orange-500">{FEST_CONFIG.scoring.SPORTS.group["3rd"]} pts</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3 mb-1">Individual: Same as group but lower points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-accent" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-secondary/50 rounded-xl border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm transition-all appearance-none cursor-pointer"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <label className="flex items-center gap-3 px-4 py-2.5 bg-secondary/50 rounded-xl border border-border hover:border-accent/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm">Completed only</span>
        </label>
      </div>

      {/* Results by Event */}
      <div className="space-y-4">
        {Object.entries(resultsByEvent)
          .filter(([eventId]) => !selectedEvent || eventId === selectedEvent)
          .filter(([eventId]) => {
            if (!filterCompleted) return true
            const event = getEvent(eventId)
            return event?.status === "completed"
          })
          .map(([eventId, eventResults]) => {
            const event = getEvent(eventId)
            if (!event) return null

            // Sort by position
            const sortedResults = [...eventResults].sort((a, b) => {
              const order = { "1st": 0, "2nd": 1, "3rd": 2, "participation": 3 }
              return order[a.position] - order[b.position]
            })

            return (
              <div key={eventId} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-border bg-gradient-to-r from-secondary/50 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-accent/10 rounded-xl">
                      <Trophy size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{event.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>•</span>
                        <span>{event.venue}</span>
                        <span>•</span>
                        <span className="capitalize">{event.category.toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                      event.status === "completed" 
                        ? "bg-green-500/15 text-green-500 ring-1 ring-green-500/30" 
                        : "bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/30"
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {sortedResults.map((result, index) => {
                    const team = getTeam(result.team_id)
                    const posConfig = POSITIONS.find(p => p.value === result.position)

                    return (
                      <div 
                        key={result.id} 
                        className={`p-5 flex items-center justify-between bg-gradient-to-r ${posConfig?.gradient} hover:brightness-95 transition-all animate-in fade-in slide-in-from-left-2`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl ${posConfig?.color} shadow-inner`}>
                            {posConfig?.icon}
                          </div>
                          <div>
                            {result.participant_name && (
                              <p className="font-semibold text-lg">{result.participant_name}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{team?.name || "Unknown Team"}</span>
                              <span 
                                className="px-2 py-1 text-xs font-bold rounded-lg shadow-sm"
                                style={{ 
                                  backgroundColor: (team?.color || "#888") + "25", 
                                  color: team?.color || "#888",
                                  boxShadow: `0 0 0 1px ${(team?.color || "#888")}30`
                                }}
                              >
                                {team?.short_name}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-accent">+{result.points}</span>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete result"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>

      {results.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
            <Medal size={64} className="relative mx-auto mb-6 opacity-50" />
          </div>
          <p className="text-xl font-medium mb-2">No results recorded yet</p>
          <p className="text-sm opacity-70">Start adding results for events</p>
        </div>
      )}
      
      {/* Poster Generator Modal */}
      {showPoster && posterData && (
        <ResultPoster
          data={posterData}
          autoSave={true}
          onClose={() => {
            setShowPoster(false)
            setPosterData(null)
          }}
        />
      )}

    </div>
  )
}
