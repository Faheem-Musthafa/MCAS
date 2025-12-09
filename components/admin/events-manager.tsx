"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Trash2, X, Check, Loader2, MapPin, Users, Plus, RefreshCw } from "lucide-react"
import type { DbEvent, CategoryType, EventType, StageType } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "group", label: "Group" },
  { value: "team", label: "Team" },
]

const STAGE_TYPES: { value: StageType; label: string; icon: string }[] = [
  { value: "on-stage", label: "On-Stage", icon: "🎤" },
  { value: "off-stage", label: "Off-Stage", icon: "📝" },
]



export function EventsManager() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<DbEvent>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStage, setFilterStage] = useState<StageType | null>(null)
  const [filterCategory, setFilterCategory] = useState<CategoryType | null>(null)
  
  const [newEvent, setNewEvent] = useState<Partial<DbEvent>>({
    title: "",
    venue: "",
    category: "ART",
    stage_type: "off-stage",
    event_type: "individual",
    participant_limit: null,
    registration_open: true,
    rules: "",
  })

  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      const params = new URLSearchParams()
      if (filterStage) params.set("stage_type", filterStage)
      if (filterCategory) params.set("category", filterCategory)
      
      const res = await fetch(`/api/events?${params.toString()}`)
      if (res.ok) {
        setEvents(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filterStage, filterCategory])

  useEffect(() => {
    fetchEvents()
    // Auto-refresh for real-time updates
    const interval = setInterval(() => fetchEvents(true), FEST_CONFIG.refreshInterval)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const handleEdit = (event: DbEvent) => {
    setEditingId(event.id)
    setEditForm(event)
  }

  const handleSave = async () => {
    if (editingId && editForm) {
      setSaving(true)
      try {
        const res = await fetch(`/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        if (res.ok) {
          const updated = await res.json()
          setEvents(events.map((e) => (e.id === editingId ? updated : e)))
          setEditingId(null)
          setEditForm({})
        }
      } catch (error) {
        console.error("Failed to update event:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
        if (res.ok) {
          setEvents(events.filter((e) => e.id !== id))
        }
      } catch (error) {
        console.error("Failed to delete event:", error)
      }
    }
  }

  const handleAdd = async () => {
    if (newEvent.title && newEvent.venue) {
      setSaving(true)
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        })
        if (res.ok) {
          const created = await res.json()
          setEvents([created, ...events])
          setNewEvent({
            title: "",
            venue: "",
            category: "ART",
            stage_type: "off-stage",
            event_type: "individual",
            participant_limit: null,
            registration_open: true,
            rules: "",
          })
          setShowAddForm(false)
        } else {
          // Handle error response
          const errorData = await res.json()
          console.error("Error creating event:", errorData)
          alert(`Failed to create event: ${errorData.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error("Failed to create event:", error)
        alert("Failed to create event. Please try again.")
      } finally {
        setSaving(false)
      }
    } else {
      alert("Please fill in all required fields (Title and Venue)")
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Add New Event */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div 
          className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between cursor-pointer"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Plus size={20} className="text-accent" />
            Add New Event
          </h3>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            {showAddForm ? "Collapse" : "Expand"}
          </button>
        </div>
        
        {showAddForm && (
          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title *</label>
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 bg-card/90 text-card-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus-visible-enhanced text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue *</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CategoryType })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="ART">🎨 Arts</option>
                  <option value="SPORTS">⚽ Sports</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={newEvent.stage_type}
                  onChange={(e) => setNewEvent({ ...newEvent, stage_type: e.target.value as StageType })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {STAGE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as EventType })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={saving || !newEvent.title || !newEvent.venue}
              className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Event"}
            </button>
          </div>
        )}
      </div>

      {/* Section 2: View All Events */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">All Events</h2>
            <button
              onClick={() => fetchEvents(true)}
              disabled={refreshing}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Refresh events"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory || ""}
              onChange={(e) => setFilterCategory(e.target.value as CategoryType || null)}
              className="px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
            >
              <option value="">All Categories</option>
              <option value="ART">Arts</option>
              <option value="SPORTS">Sports</option>
            </select>

            <select
              value={filterStage || ""}
              onChange={(e) => setFilterStage(e.target.value as StageType || null)}
              className="px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
            >
              <option value="">All Types</option>
              {STAGE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:border-accent/50 transition-colors"
            >
              {/* Event Header */}
              <div className="p-3 bg-secondary/50 border-b border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.category === "ART" ? "bg-purple-500/80 text-white" : "bg-green-500/80 text-white"
                  }`}>
                    {event.category === "ART" ? "🎨 Arts" : "⚽ Sports"}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.stage_type === "on-stage" ? "bg-amber-500/80 text-white" : "bg-slate-500/80 text-white"
                  }`}>
                    {event.stage_type === "on-stage" ? "🎤 On-Stage" : "📝 Off-Stage"}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 space-y-3">
                {editingId === event.id ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Title</label>
                      <input
                        type="text"
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
                        placeholder="Event Title"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Venue</label>
                      <input
                        type="text"
                        value={editForm.venue || ""}
                        onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
                        placeholder="Venue"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <select
                        value={editForm.category || "ART"}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as CategoryType })}
                        className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
                      >
                        <option value="ART">🎨 Arts</option>
                        <option value="SPORTS">⚽ Sports</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Type</label>
                        <select
                          value={editForm.stage_type || "off-stage"}
                          onChange={(e) => setEditForm({ ...editForm, stage_type: e.target.value as StageType })}
                          className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
                        >
                          {STAGE_TYPES.map((s) => (
                            <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Mode</label>
                        <select
                          value={editForm.event_type || "individual"}
                          onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value as EventType })}
                          className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
                        >
                          {EVENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>


                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {editingId === event.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Plus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No events found</p>
            <p className="text-sm">Create your first event to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
