"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Pencil, Trash2, X, Check, Loader2, Users, Trophy, Medal } from "lucide-react"
import type { DbTeam } from "@/lib/supabase/types"

// Common college departments
const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Information Technology",
  "Commerce",
  "Management",
  "Arts",
  "Science",
]

export function TeamsManager() {
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<DbTeam>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTeam, setNewTeam] = useState<Partial<DbTeam>>({
    name: "",
    short_name: "",
    department: "",
    color: "#3b82f6",
    logo: "",
    total_points: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  })

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        setTeams(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (team: DbTeam) => {
    setEditingId(team.id)
    setEditForm(team)
  }

  const handleSave = async () => {
    if (editingId && editForm) {
      setSaving(true)
      try {
        const res = await fetch(`/api/teams/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        if (res.ok) {
          const updated = await res.json()
          setTeams(teams.map((t) => (t.id === editingId ? updated : t)))
          setEditingId(null)
          setEditForm({})
        }
      } catch (error) {
        console.error("Failed to update team:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team? This will also delete all their results.")) {
      try {
        const res = await fetch(`/api/teams/${id}`, { method: "DELETE" })
        if (res.ok) {
          setTeams(teams.filter((t) => t.id !== id))
        }
      } catch (error) {
        console.error("Failed to delete team:", error)
      }
    }
  }

  const handleAdd = async () => {
    if (newTeam.name && newTeam.department) {
      setSaving(true)
      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTeam),
        })
        if (res.ok) {
          const created = await res.json()
          setTeams([...teams, created])
          setNewTeam({
            name: "",
            short_name: "",
            department: "",
            color: "#3b82f6",
            logo: "",
            total_points: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
          })
          setShowAddForm(false)
        }
      } catch (error) {
        console.error("Failed to create team:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  // Auto-generate short name from department
  const generateShortName = (dept: string) => {
    return dept.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  // Sort teams by total points for ranking
  const rankedTeams = [...teams].sort((a, b) => b.total_points - a.total_points)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Department Team"}
        </button>
        <div className="text-sm text-muted-foreground">
          {teams.length} teams registered
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold text-lg">Add Department Team</h3>
          <p className="text-sm text-muted-foreground">
            Each department competes as a team. Points are earned from individual and group events.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Team Name (e.g., CS Titans) *"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={newTeam.department}
              onChange={(e) => {
                const dept = e.target.value
                setNewTeam({ 
                  ...newTeam, 
                  department: dept,
                  short_name: generateShortName(dept)
                })
              }}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Department *</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Short Name (e.g., CS)"
              value={newTeam.short_name}
              onChange={(e) => setNewTeam({ ...newTeam, short_name: e.target.value.toUpperCase() })}
              className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              maxLength={4}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Team Color:</label>
              <input
                type="color"
                value={newTeam.color}
                onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                className="w-12 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={newTeam.color}
                onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                className="flex-1 px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <input
              type="text"
              placeholder="Logo URL (optional)"
              value={newTeam.logo || ""}
              onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
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
                    setNewTeam({ ...newTeam, logo: dataUrl })
                  } catch (err) {
                    console.error("Failed to read image file", err)
                  }
                }
              }}
              className="px-4 py-2 bg-secondary rounded-lg border border-border"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !newTeam.name || !newTeam.department}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Team"}
          </button>
        </div>
      )}

      {/* Leaderboard / Teams Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            Overall Standings
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  🥇
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  🥈
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  🥉
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rankedTeams.map((team, index) => {
                const rank = index + 1
                const isEditing = editingId === team.id

                return (
                  <tr 
                    key={team.id} 
                    className={`hover:bg-secondary/50 transition-colors ${
                      rank === 1 ? "bg-yellow-500/5" : rank === 2 ? "bg-gray-500/5" : rank === 3 ? "bg-orange-500/5" : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-4">
                      <span className={`text-2xl font-bold ${
                        rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-500" : "text-muted-foreground"
                      }`}>
                        {rank}
                      </span>
                    </td>

                    {/* Team Info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                          style={{ backgroundColor: team.color + "20" }}
                        >
                          {team.logo ? (
                            <Image
                              src={isEditing ? editForm.logo || team.logo : team.logo}
                              alt={team.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold" style={{ color: team.color }}>
                              {team.short_name}
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="px-2 py-1 bg-secondary rounded border border-border text-sm w-full"
                              placeholder="Team Name"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editForm.short_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, short_name: e.target.value.toUpperCase() })}
                                className="px-2 py-1 bg-secondary rounded border border-border text-xs w-16"
                                placeholder="Short"
                                maxLength={4}
                              />
                              <input
                                type="color"
                                value={editForm.color || team.color}
                                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                className="w-8 h-6 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{team.name}</span>
                              <span 
                                className="px-1.5 py-0.5 text-xs font-bold rounded"
                                style={{ backgroundColor: team.color + "20", color: team.color }}
                              >
                                {team.short_name}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{team.department}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Medals */}
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-yellow-500">{team.gold}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-gray-400">{team.silver}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-orange-500">{team.bronze}</span>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-xl font-bold text-accent">{team.total_points}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
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
                              onClick={() => handleEdit(team)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(team.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No teams registered yet</p>
          <p className="text-sm">Add department teams to start tracking scores</p>
        </div>
      )}

      {/* Points System Info */}
      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Medal size={16} className="text-accent" />
          Points System
        </h4>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>🥇 1st Place: <strong className="text-foreground">10 pts</strong></span>
          <span>🥈 2nd Place: <strong className="text-foreground">7 pts</strong></span>
          <span>🥉 3rd Place: <strong className="text-foreground">5 pts</strong></span>
          <span>Participation: <strong className="text-foreground">1 pt</strong></span>
        </div>
      </div>
    </div>
  )
}
