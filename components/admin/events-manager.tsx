"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Pencil, Trash2, X, Check, Loader2, Calendar, Clock, MapPin, Users, Mic, PenTool, Plus, RefreshCw } from "lucide-react"
import type { DbEvent, CategoryType, EventType, EventStatus, StageType } from "@/lib/supabase/types"
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

const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: "upcoming", label: "Upcoming", color: "bg-blue-500/10 text-blue-500" },
  { value: "ongoing", label: "Ongoing", color: "bg-green-500/10 text-green-500" },
  { value: "completed", label: "Completed", color: "bg-gray-500/10 text-gray-500" },
]


export function EventsManager() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<DbEvent>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterDay, setFilterDay] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<EventStatus | null>(null)
  const [filterStage, setFilterStage] = useState<StageType | null>(null)
  const [filterCategory, setFilterCategory] = useState<CategoryType | null>(null)
  
  const [newEvent, setNewEvent] = useState<Partial<DbEvent>>({
    title: "",
    venue: "",
    day: 1,
    time_slot: "10:00 AM",
    category: "ART",
    stage_type: "off-stage",
    event_type: "individual",
    participant_limit: null,
    registration_open: true,
    status: "upcoming",
    rules: "",
    image: "",
  })

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      const params = new URLSearchParams()
      if (filterDay) params.set("day", filterDay.toString())
      if (filterStatus) params.set("status", filterStatus)
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
  }, [filterDay, filterStatus, filterStage, filterCategory])

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
        // Exclude status from update to prevent overwriting live status changes (e.g. completed by results)
        const { status, ...updateData } = editForm

        const res = await fetch(`/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
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
            date: "",
            day: 1,
            time_slot: "10:00 AM",
            category: "ART",
            stage_type: "off-stage",
            event_type: "individual",
            participant_limit: null,
            registration_open: true,
            status: "upcoming",
            rules: "",
            image: "",
          })
          setShowAddForm(false)
        }
      } catch (error) {
        console.error("Failed to create event:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const getStatusBadge = (status: EventStatus) => {
    const config = EVENT_STATUSES.find((s) => s.value === status)
    return config || EVENT_STATUSES[0]
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
                  placeholder="e.g. Solo Singing"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
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
                <label className="text-sm font-medium">Time</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={newEvent.time_slot}
                  onChange={(e) => setNewEvent({ ...newEvent, time_slot: e.target.value })}
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
                  

              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newEvent.image || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                    className="flex-1 px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {  
                        const f = e.target.files?.[0]
                        if (f) {
                          try {
                            const dataUrl = await fileToDataUrl(f)
                            setNewEvent({ ...newEvent, image: dataUrl })
                          } catch (err) {
                            console.error("Failed to read image file", err)
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="px-3 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80">
                      Upload
                    </button>
                  </div>
                </div>
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
              {/* Event Image */}
              <div className="relative aspect-video bg-secondary">
                <Image
                  src={editingId === event.id ? editForm.image || event.image || "/placeholder.svg" : event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
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
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <span className="px-2 py-1 text-xs font-bold bg-black/50 text-white rounded">
                    Day {event.day}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(event.status).color}`}>
                    {getStatusBadge(event.status).label}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 space-y-3">
                {editingId === event.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-2 py-1 bg-secondary rounded border border-border text-sm"
                      placeholder="Title"
                    />
                    
                    <input
                      type="text"
                      value={editForm.venue || ""}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                      className="w-full px-2 py-1 bg-secondary rounded border border-border text-xs"
                      placeholder="Venue"
                    />
                    <input
                      type="text"
                      value={editForm.time_slot || ""}
                      onChange={(e) => setEditForm({ ...editForm, time_slot: e.target.value })}
                      className="w-full px-2 py-1 bg-secondary rounded border border-border text-xs"
                      placeholder="Time Slot"
                    />
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
                        <Clock size={14} />
                        <span>{event.time_slot}</span>
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
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No events found</p>
            <p className="text-sm">Create your first event to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
