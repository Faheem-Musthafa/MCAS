"use client"

import { useState, useEffect } from "react"
import { Loader2, Trophy, Medal, Trash2, Award, Check, RefreshCw } from "lucide-react"
import type { DbEvent, DbTeam, DbResultWithTeam, ResultPosition } from "@/lib/supabase/types"

const POSITIONS: { value: ResultPosition; label: string; icon: string; color: string }[] = [
  { value: "1st", label: "1st Place", icon: "🥇", color: "text-yellow-500 bg-yellow-500/10" },
  { value: "2nd", label: "2nd Place", icon: "🥈", color: "text-gray-400 bg-gray-500/10" },
  { value: "3rd", label: "3rd Place", icon: "🥉", color: "text-orange-500 bg-orange-500/10" },
  { value: "participation", label: "Participation", icon: "🎖️", color: "text-blue-500 bg-blue-500/10" },
]

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

  // New result form
  const [newResult, setNewResult] = useState({
    event_id: "",
    team_id: "",
    position: "1st" as ResultPosition,
    participant_name: "",
    remarks: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData(isRefresh = false) {
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

      if (!eventsRes.ok) {
        const err = await eventsRes.json().catch(() => ({}))
        throw new Error(err.error || "Failed to fetch events")
      }
      if (!teamsRes.ok) {
        const err = await teamsRes.json().catch(() => ({}))
        throw new Error(err.error || "Failed to fetch teams")
      }
      if (!resultsRes.ok) {
        const err = await resultsRes.json().catch(() => ({}))
        throw new Error(err.error || "Failed to fetch results")
      }

      const eventsData = await eventsRes.json()
      const teamsData = await teamsRes.json()
      const resultsData = await resultsRes.json()

      setEvents(eventsData)
      setTeams(teamsData)
      setResults(resultsData)

      console.log("Fetched data:", { events: eventsData.length, teams: teamsData.length, results: resultsData.length })
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAddResult = async () => {
    if (!newResult.event_id || !newResult.team_id) {
      alert("Please select both event and team")
      return
    }

    // Check if this team already has a result for this event
    const existingResult = results.find(
      r => r.event_id === newResult.event_id && r.team_id === newResult.team_id
    )
    if (existingResult) {
      alert("This team already has a result for this event")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResult),
      })

      if (res.ok) {
        const created = await res.json()
        setResults([created, ...results])
        setNewResult({
          event_id: newResult.event_id, // Keep event selected for batch entry
          team_id: "",
          position: "1st",
          participant_name: "",
          remarks: "",
        })
        // Refresh teams to get updated points
        const teamsRes = await fetch("/api/teams")
        if (teamsRes.ok) setTeams(await teamsRes.json())
      }
    } catch (error) {
      console.error("Failed to add result:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResult = async (id: string) => {
    if (!confirm("Delete this result? Team points will be recalculated.")) return

    try {
      const res = await fetch(`/api/results/${id}`, { method: "DELETE" })
      if (res.ok) {
        setResults(results.filter(r => r.id !== id))
        // Refresh teams to get updated points
        const teamsRes = await fetch("/api/teams")
        if (teamsRes.ok) setTeams(await teamsRes.json())
      }
    } catch (error) {
      console.error("Failed to delete result:", error)
    }
  }

  const getTeam = (id: string) => teams.find(t => t.id === id)
  const getEvent = (id: string) => events.find(e => e.id === id)

  // All events can have results recorded (removed status filter)
  const completedEvents = events.filter(e => e.status === "completed")

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
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
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

      {/* Add Result Form */}
      <div className="p-6 bg-card rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Award size={20} className="text-accent" />
            Record Event Result
          </h3>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Add results for events. Team points are automatically calculated.
          {events.length === 0 && " (No events found - please create events first)"}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={newResult.event_id}
            onChange={(e) => setNewResult({ ...newResult, event_id: e.target.value })}
            className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Event * ({events.length} available)</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} (Day {event.day}) - {event.status}
              </option>
            ))}
          </select>

          <select
            value={newResult.team_id}
            onChange={(e) => setNewResult({ ...newResult, team_id: e.target.value })}
            className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Team * ({teams.length} available)</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.short_name})
              </option>
            ))}
          </select>

          <select
            value={newResult.position}
            onChange={(e) => setNewResult({ ...newResult, position: e.target.value as ResultPosition })}
            className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.icon} {pos.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Participant Name (for individual events)"
            value={newResult.participant_name}
            onChange={(e) => setNewResult({ ...newResult, participant_name: e.target.value })}
            className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Remarks (optional)"
            value={newResult.remarks}
            onChange={(e) => setNewResult({ ...newResult, remarks: e.target.value })}
            className="flex-1 px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleAddResult}
            disabled={saving || !newResult.event_id || !newResult.team_id}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Add Result
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2 bg-secondary rounded-lg border border-border text-sm"
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.checked)}
            className="w-4 h-4"
          />
          Show only completed events
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
              <div key={eventId} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy size={16} className="text-accent" />
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Day {event.day} • {event.venue} • {event.category}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {sortedResults.map((result) => {
                    const team = getTeam(result.team_id)
                    const posConfig = POSITIONS.find(p => p.value === result.position)

                    return (
                      <div key={result.id} className="p-4 flex items-center justify-between hover:bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1.5 rounded-lg text-lg ${posConfig?.color}`}>
                            {posConfig?.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{team?.name || "Unknown Team"}</span>
                              <span 
                                className="px-1.5 py-0.5 text-xs font-bold rounded"
                                style={{ 
                                  backgroundColor: (team?.color || "#888") + "20", 
                                  color: team?.color || "#888" 
                                }}
                              >
                                {team?.short_name}
                              </span>
                            </div>
                            {result.participant_name && (
                              <p className="text-sm text-muted-foreground">{result.participant_name}</p>
                            )}
                            {result.notes && (
                              <p className="text-xs text-muted-foreground italic">{result.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-accent">+{result.points} pts</span>
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
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
        <div className="text-center py-12 text-muted-foreground">
          <Medal size={48} className="mx-auto mb-4 opacity-50" />
          <p>No results recorded yet</p>
          <p className="text-sm">Start adding results for completed events</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <div className="text-3xl font-bold text-accent">{completedEvents.length}</div>
          <div className="text-sm text-muted-foreground">Events Completed</div>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <div className="text-3xl font-bold text-yellow-500">{results.filter(r => r.position === "1st").length}</div>
          <div className="text-sm text-muted-foreground">Gold Awarded</div>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <div className="text-3xl font-bold text-gray-400">{results.filter(r => r.position === "2nd").length}</div>
          <div className="text-sm text-muted-foreground">Silver Awarded</div>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <div className="text-3xl font-bold text-orange-500">{results.filter(r => r.position === "3rd").length}</div>
          <div className="text-sm text-muted-foreground">Bronze Awarded</div>
        </div>
      </div>
    </div>
  )
}
