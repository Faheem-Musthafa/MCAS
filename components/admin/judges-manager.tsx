"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Save, X, Award } from "lucide-react"
import { initialJudges, type Judge } from "@/lib/data"

export function JudgesManager() {
  const [judges, setJudges] = useState<Judge[]>(initialJudges)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newJudge, setNewJudge] = useState<Partial<Judge>>({ name: "", expertise: "", image: "" })
  const [editJudge, setEditJudge] = useState<Judge | null>(null)

  const handleAdd = () => {
    if (!newJudge.name || !newJudge.expertise) return
    const judge: Judge = {
      id: Date.now(),
      name: newJudge.name,
      expertise: newJudge.expertise,
      image: newJudge.image || "/professional-judge-portrait.jpg",
    }
    setJudges([...judges, judge])
    setNewJudge({ name: "", expertise: "", image: "" })
    setIsAdding(false)
  }

  const handleEdit = (judge: Judge) => {
    setEditingId(judge.id)
    setEditJudge({ ...judge })
  }

  const handleSave = () => {
    if (!editJudge) return
    setJudges(judges.map((j) => (j.id === editJudge.id ? editJudge : j)))
    setEditingId(null)
    setEditJudge(null)
  }

  const handleDelete = (id: number) => {
    setJudges(judges.filter((j) => j.id !== id))
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
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium"
            >
              <Save size={16} />
              Save Judge
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
                    value={editJudge.image}
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
                    <button onClick={handleSave} className="p-2 text-accent hover:text-accent/80">
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
