"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Save, X, Award, Loader2, Copy, Check } from "lucide-react"
import type { DbJudge } from "@/lib/supabase/types"

export function JudgesManager() {
  const [judges, setJudges] = useState<DbJudge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newJudge, setNewJudge] = useState<Partial<DbJudge>>({ name: "", expertise: "", image: "" })
  const [editJudge, setEditJudge] = useState<DbJudge | null>(null)

  useEffect(() => {
    fetchJudges()
  }, [])

  async function fetchJudges() {
    try {
      const res = await fetch("/api/judges")
      if (res.ok) {
        setJudges(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch judges:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newJudge.name || !newJudge.expertise) return
    setSaving(true)
    try {
      const res = await fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newJudge.name,
          expertise: newJudge.expertise,
          image: newJudge.image || "/professional-judge-portrait.jpg",
          access_code: `JUDGE${Date.now().toString().slice(-6)}`,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setJudges([...judges, created])
        setNewJudge({ name: "", expertise: "", image: "" })
        setIsAdding(false)
      }
    } catch (error) {
      console.error("Failed to create judge:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (judge: DbJudge) => {
    setEditingId(judge.id)
    setEditJudge({ ...judge })
  }

  const handleSave = async () => {
    if (!editJudge) return
    setSaving(true)
    try {
      const res = await fetch(`/api/judges/${editJudge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJudge),
      })
      if (res.ok) {
        const updated = await res.json()
        setJudges(judges.map((j) => (j.id === editJudge.id ? updated : j)))
        setEditingId(null)
        setEditJudge(null)
      }
    } catch (error) {
      console.error("Failed to update judge:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this judge?")) return
    try {
      const res = await fetch(`/api/judges/${id}`, { method: "DELETE" })
      if (res.ok) {
        setJudges(judges.filter((j) => j.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete judge:", error)
    }
  }

  const copyAccessCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus size={16} />
          Add Judge
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold">Add New Judge</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Name</label>
              <input
                type="text"
                value={newJudge.name}
                onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
                placeholder="Dr. Jane Smith"
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Expertise</label>
              <input
                type="text"
                value={newJudge.expertise}
                onChange={(e) => setNewJudge({ ...newJudge, expertise: e.target.value })}
                placeholder="Fine Arts, Music, Sports..."
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Image URL (optional)</label>
            <input
              type="text"
              value={newJudge.image}
              onChange={(e) => setNewJudge({ ...newJudge, image: e.target.value })}
              placeholder="/professional-judge-portrait.jpg"
              className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Judge"}
            </button>
          </div>
        </div>
      )}

      {/* Judges Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {judges.map((judge) => {
          const isEditing = editingId === judge.id

          return (
            <div
              key={judge.id}
              className="p-6 bg-card rounded-xl border border-border group hover:border-accent/30 transition-colors"
            >
              {isEditing && editJudge ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editJudge.name}
                    onChange={(e) => setEditJudge({ ...editJudge, name: e.target.value })}
                    className="w-full p-2 bg-secondary rounded-lg border border-border text-sm font-medium"
                  />
                  <input
                    type="text"
                    value={editJudge.expertise}
                    onChange={(e) => setEditJudge({ ...editJudge, expertise: e.target.value })}
                    className="w-full p-2 bg-secondary rounded-lg border border-border text-sm"
                  />
                  <input
                    type="text"
                    value={editJudge.image || ""}
                    onChange={(e) => setEditJudge({ ...editJudge, image: e.target.value })}
                    className="w-full p-2 bg-secondary rounded-lg border border-border text-sm"
                    placeholder="Image URL"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditJudge(null)
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                    <button onClick={handleSave} disabled={saving} className="p-2 text-accent hover:text-accent/80 disabled:opacity-50">
                      <Save size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={judge.image || "/placeholder.svg"}
                      alt={judge.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover ring-2 ring-border"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold">{judge.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Award size={12} />
                        {judge.expertise}
                      </p>
                    </div>
                  </div>

                  {/* Access Code Section */}
                  <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Access Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono">{judge.access_code}</code>
                      <button
                        onClick={() => copyAccessCode(judge.access_code, judge.id)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === judge.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(judge)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(judge.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
