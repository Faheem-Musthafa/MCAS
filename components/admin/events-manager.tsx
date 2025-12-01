"use client"

import { useState } from "react"
import Image from "next/image"
import { Pencil, Trash2, X, Check } from "lucide-react"
import { initialEvents, type Event } from "@/lib/data"

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Event>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    venue: "",
    date: "",
    category: "ART",
    image: "/placeholder.svg?height=200&width=300",
  })

  const handleEdit = (event: Event) => {
    setEditingId(event.id)
    setEditForm(event)
  }

  const handleSave = () => {
    if (editingId && editForm) {
      setEvents(events.map((e) => (e.id === editingId ? { ...e, ...editForm } : e)))
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((e) => e.id !== id))
    }
  }

  const handleAdd = () => {
    if (newEvent.title && newEvent.venue && newEvent.date) {
      const newId = Math.max(...events.map((e) => e.id), 0) + 1
      setEvents([...events, { ...newEvent, id: newId } as Event])
      setNewEvent({
        title: "",
        venue: "",
        date: "",
        category: "ART",
        image: "/placeholder.svg?height=200&width=300",
      })
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Event Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        {showAddForm ? "Cancel" : "Add New Event"}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold">Add New Event</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Venue"
              value={newEvent.venue}
              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Date (e.g., DEC 15-16)"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as "ART" | "SPORTS" })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="ART">Art</option>
              <option value="SPORTS">Sports</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Create Event
          </button>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {editingId === event.id ? (
                        <input
                          type="text"
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="px-2 py-1 bg-secondary rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      ) : (
                        <span className="font-medium">{event.title}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === event.id ? (
                      <input
                        type="text"
                        value={editForm.venue || ""}
                        onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                        className="px-2 py-1 bg-secondary rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    ) : (
                      <span className="text-muted-foreground">{event.venue}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === event.id ? (
                      <input
                        type="text"
                        value={editForm.date || ""}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="px-2 py-1 bg-secondary rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    ) : (
                      <span className="text-muted-foreground">{event.date}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === event.id ? (
                      <select
                        value={editForm.category || "ART"}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as "ART" | "SPORTS" })}
                        className="px-2 py-1 bg-secondary rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="ART">Art</option>
                        <option value="SPORTS">Sports</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.category === "ART"
                            ? "bg-purple-500/10 text-purple-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {event.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === event.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
