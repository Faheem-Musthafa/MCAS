"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Pencil, Trash2, X, Check, Loader2, Calendar, Clock, MapPin, Users, Mic, PenTool } from "lucide-react"
import type { DbEvent, CategoryType, EventType, EventStatus, StageType } from "@/lib/supabase/types"

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

const FEST_DAYS = [1, 2, 3, 4, 5, 6]

export function EventsManager() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<DbEvent>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterDay, setFilterDay] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<EventStatus | null>(null)
  const [filterStage, setFilterStage] = useState<StageType | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<DbEvent>>({
    title: "",
    venue: "",
    date: "",
    day: 1,
    time_slot: "10:00 AM - 12:00 PM",
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

  useEffect(() => {
    fetchEvents()
  }, [filterDay, filterStatus, filterStage])

  async function fetchEvents() {
    try {
      const params = new URLSearchParams()
      if (filterDay) params.set("day", filterDay.toString())
      if (filterStatus) params.set("status", filterStatus)
      if (filterStage) params.set("stage_type", filterStage)
      
      const res = await fetch(`/api/events?${params.toString()}`)
      if (res.ok) {
        setEvents(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

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
            date: "",
            day: 1,
            time_slot: "10:00 AM - 12:00 PM",
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
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add New Event"}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={filterDay || ""}
            onChange={(e) => setFilterDay(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
          >
            <option value="">All Days</option>
            {FEST_DAYS.map((day) => (
              <option key={day} value={day}>Day {day}</option>
            ))}
          </select>

          <select
            value={filterStatus || ""}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus || null)}
            className="px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
          >
            <option value="">All Status</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterStage || ""}
            onChange={(e) => setFilterStage(e.target.value as StageType || null)}
            className="px-3 py-2 bg-secondary rounded-lg border border-border text-sm"
          >
            <option value="">All Types</option>
            {STAGE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold text-lg">Add New Event</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Event Title *"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Venue *"
              value={newEvent.venue}
              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Date (e.g., DEC 15)"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newEvent.day}
              onChange={(e) => setNewEvent({ ...newEvent, day: parseInt(e.target.value) })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {FEST_DAYS.map((day) => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Time Slot (e.g., 10:00 AM - 12:00 PM)"
              value={newEvent.time_slot}
              onChange={(e) => setNewEvent({ ...newEvent, time_slot: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CategoryType })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="ART">🎨 Arts</option>
              <option value="SPORTS">⚽ Sports</option>
            </select>
            <select
              value={newEvent.stage_type}
              onChange={(e) => setNewEvent({ ...newEvent, stage_type: e.target.value as StageType })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {STAGE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
              ))}
            </select>
            <select
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as EventType })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Participant Limit (optional)"
              value={newEvent.participant_limit || ""}
              onChange={(e) => setNewEvent({ ...newEvent, participant_limit: e.target.value ? parseInt(e.target.value) : null })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as EventStatus })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newEvent.image || ""}
              onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
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
              className="px-4 py-2 bg-secondary rounded-lg border border-border"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registration_open"
                checked={newEvent.registration_open}
                onChange={(e) => setNewEvent({ ...newEvent, registration_open: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="registration_open" className="text-sm">Registration Open</label>
            </div>
          </div>
          <textarea
            placeholder="Rules & Guidelines (optional)"
            value={newEvent.rules || ""}
            onChange={(e) => setNewEvent({ ...newEvent, rules: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newEvent.title || !newEvent.venue}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Event"}
          </button>
        </div>
      )}

      {/* Events Grid */}
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
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={editForm.day || 1}
                      onChange={(e) => setEditForm({ ...editForm, day: parseInt(e.target.value) })}
                      className="px-2 py-1 bg-secondary rounded border border-border text-xs"
                    >
                      {FEST_DAYS.map((day) => (
                        <option key={day} value={day}>Day {day}</option>
                      ))}
                    </select>
                    <select
                      value={editForm.status || "upcoming"}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EventStatus })}
                      className="px-2 py-1 bg-secondary rounded border border-border text-xs"
                    >
                      {EVENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
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
                  <input
                    type="text"
                    value={editForm.image || ""}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="w-full px-2 py-1 bg-secondary rounded border border-border text-xs"
                    placeholder="Image URL"
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
                      {event.participant_limit && (
                        <span className="text-xs">• Max {event.participant_limit}</span>
                      )}
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
  )
}
