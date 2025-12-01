"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Pencil, Trash2, X, Check, GripVertical, Loader2 } from "lucide-react"
import type { DbGalleryItem } from "@/lib/supabase/types"

interface GalleryItemWithSpan extends DbGalleryItem {
  span: string
}

export function GalleryManager() {
  const [gallery, setGallery] = useState<GalleryItemWithSpan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<GalleryItemWithSpan>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<Partial<GalleryItemWithSpan>>({
    title: "",
    src: "/placeholder.svg?height=400&width=600",
    span: "col-span-1 row-span-1",
  })

  const spanPatterns = [
    "col-span-2 row-span-2",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-2 row-span-1",
    "col-span-1 row-span-1",
  ]

  useEffect(() => {
    fetchGallery()
  }, [])

  async function fetchGallery() {
    try {
      const res = await fetch("/api/gallery")
      if (res.ok) {
        const data: DbGalleryItem[] = await res.json()
        const withSpans = data.map((item, index) => ({
          ...item,
          span: spanPatterns[index % spanPatterns.length],
        }))
        setGallery(withSpans)
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: GalleryItemWithSpan) => {
    setEditingId(item.id)
    setEditForm(item)
  }

  const handleSave = async () => {
    if (editingId && editForm) {
      setSaving(true)
      try {
        const res = await fetch(`/api/gallery/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editForm.title,
            src: editForm.src,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setGallery(gallery.map((g) => (g.id === editingId ? { ...updated, span: editForm.span } : g)))
          setEditingId(null)
          setEditForm({})
        }
      } catch (error) {
        console.error("Failed to update gallery item:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      try {
        const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" })
        if (res.ok) {
          setGallery(gallery.filter((g) => g.id !== id))
        }
      } catch (error) {
        console.error("Failed to delete gallery item:", error)
      }
    }
  }

  const handleAdd = async () => {
    if (newItem.title) {
      setSaving(true)
      try {
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newItem.title,
            src: newItem.src,
          }),
        })
        if (res.ok) {
          const created = await res.json()
          setGallery([...gallery, { ...created, span: newItem.span || "col-span-1 row-span-1" }])
          setNewItem({
            title: "",
            src: "/placeholder.svg?height=400&width=600",
            span: "col-span-1 row-span-1",
          })
          setShowAddForm(false)
        }
      } catch (error) {
        console.error("Failed to create gallery item:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const spanOptions = [
    { value: "col-span-1 row-span-1", label: "Small (1x1)" },
    { value: "col-span-2 row-span-1", label: "Wide (2x1)" },
    { value: "col-span-1 row-span-2", label: "Tall (1x2)" },
    { value: "col-span-2 row-span-2", label: "Large (2x2)" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Item Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        {showAddForm ? "Cancel" : "Add New Photo"}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold">Add New Gallery Item</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Photo Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newItem.span}
              onChange={(e) => setNewItem({ ...newItem, span: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {spanOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Photo"}
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px]">
        {gallery.map((item) => (
          <div key={item.id} className={`relative rounded-xl overflow-hidden bg-secondary group ${item.span}`}>
            <Image src={item.src || "/placeholder.svg"} alt={item.title} fill className="object-cover" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
              {editingId === item.id ? (
                <div className="w-full space-y-2">
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Title"
                  />
                  <select
                    value={editForm.span || ""}
                    onChange={(e) => setEditForm({ ...editForm, span: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {spanOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-black">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 justify-center mt-2">
                    <button
                      onClick={handleSave}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-white font-medium text-center">{item.title}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Drag Handle */}
            <div className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
