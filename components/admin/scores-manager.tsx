"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Save, X, Trophy, Loader2 } from "lucide-react"
import type { DbScore, DbTeam, DbEvent, DbJudge, DbJudgeScore } from "@/lib/supabase/types"

interface ScoreWithJudgeScores extends DbScore {
  judge_scores: DbJudgeScore[]
}

export function ScoresManager() {
  const [scores, setScores] = useState<ScoreWithJudgeScores[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [events, setEvents] = useState<DbEvent[]>([])
  const [judges, setJudges] = useState<DbJudge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newScore, setNewScore] = useState<{
    event_id: string
    team_id: string
    judge_scores: { judge_id: string; score: number; criteria: string }[]
    total_score: number
  }>({
    event_id: "",
    team_id: "",
    judge_scores: [],
    total_score: 0,
  })
  const [editScore, setEditScore] = useState<ScoreWithJudgeScores | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [scoresRes, teamsRes, eventsRes, judgesRes] = await Promise.all([
        fetch("/api/scores"),
        fetch("/api/teams"),
        fetch("/api/events"),
        fetch("/api/judges"),
      ])
      if (scoresRes.ok) setScores(await scoresRes.json())
      if (teamsRes.ok) setTeams(await teamsRes.json())
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
        if (eventsData.length > 0) {
          setNewScore((prev) => ({ ...prev, event_id: eventsData[0].id }))
        }
      }
      if (judgesRes.ok) setJudges(await judgesRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teams.length > 0 && !newScore.team_id) {
      setNewScore((prev) => ({ ...prev, team_id: teams[0].id }))
    }
  }, [teams])

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId)
  const getEvent = (eventId: string) => events.find((e) => e.id === eventId)
  const getJudge = (judgeId: string) => judges.find((j) => j.id === judgeId)

  const handleAdd = async () => {
    if (!newScore.event_id || !newScore.team_id) return
    setSaving(true)
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: newScore.event_id,
          team_id: newScore.team_id,
          judge_scores: newScore.judge_scores,
          total_score: newScore.judge_scores.reduce((sum, js) => sum + js.score, 0),
          status: "pending",
          submitted_at: new Date().toISOString(),
          submitted_by: newScore.judge_scores[0]?.judge_id || null,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setScores([...scores, created])
        setNewScore({ event_id: events[0]?.id || "", team_id: teams[0]?.id || "", judge_scores: [], total_score: 0 })
        setIsAdding(false)
      }
    } catch (error) {
      console.error("Failed to create score:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (score: ScoreWithJudgeScores) => {
    setEditingId(score.id)
    setEditScore({ ...score })
  }

  const handleSave = async () => {
    if (!editScore) return
    setSaving(true)
    try {
      const total_score = editScore.judge_scores.reduce((sum, js) => sum + js.score, 0)
      const res = await fetch(`/api/scores/${editScore.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editScore, total_score }),
      })
      if (res.ok) {
        const updated = await res.json()
        setScores(scores.map((s) => (s.id === editScore.id ? updated : s)))
        setEditingId(null)
        setEditScore(null)
      }
    } catch (error) {
      console.error("Failed to update score:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return
    try {
      const res = await fetch(`/api/scores/${id}`, { method: "DELETE" })
      if (res.ok) {
        setScores(scores.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete score:", error)
    }
  }

  const updateJudgeScore = (judgeId: string, score: number, criteria: string, isEdit: boolean) => {
    if (isEdit && editScore) {
      const existing = editScore.judge_scores.findIndex((js) => js.judge_id === judgeId)
      const updated = [...editScore.judge_scores]
      if (existing >= 0) {
        updated[existing] = { ...updated[existing], judge_id: judgeId, score, criteria }
      } else {
        updated.push({ id: "", score_id: editScore.id, judge_id: judgeId, score, criteria })
      }
      setEditScore({ ...editScore, judge_scores: updated })
    } else {
      const existing = newScore.judge_scores.findIndex((js) => js.judge_id === judgeId)
      const updated = [...newScore.judge_scores]
      if (existing >= 0) {
        updated[existing] = { judge_id: judgeId, score, criteria }
      } else {
        updated.push({ judge_id: judgeId, score, criteria })
      }
      setNewScore({ ...newScore, judge_scores: updated })
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
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus size={16} />
          Add Score
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold">Add New Score</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Event</label>
              <select
                value={newScore.event_id}
                onChange={(e) => setNewScore({ ...newScore, event_id: e.target.value })}
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Team</label>
              <select
                value={newScore.team_id}
                onChange={(e) => setNewScore({ ...newScore, team_id: e.target.value })}
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Judge Scores</label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {judges.map((judge) => (
                <div key={judge.id} className="p-3 bg-secondary rounded-lg">
                  <div className="text-sm font-medium mb-2">{judge.name}</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Score"
                      className="flex-1 p-2 bg-background rounded border border-border text-sm"
                      onChange={(e) => updateJudgeScore(judge.id, Number(e.target.value), judge.expertise, false)}
                    />
                  </div>
                </div>
              ))}
            </div>
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
              {saving ? "Saving..." : "Save Score"}
            </button>
          </div>
        </div>
      )}

      {/* Scores List */}
      <div className="space-y-4">
        {scores.map((score) => {
          const team = getTeam(score.team_id)
          const event = getEvent(score.event_id)
          const isEditing = editingId === score.id

          return (
            <div key={score.id} className="p-6 bg-card rounded-xl border border-border">
              {isEditing && editScore ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Event</label>
                      <select
                        value={editScore.event_id}
                        onChange={(e) => setEditScore({ ...editScore, event_id: e.target.value })}
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                      >
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Team</label>
                      <select
                        value={editScore.team_id}
                        onChange={(e) => setEditScore({ ...editScore, team_id: e.target.value })}
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                      >
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Judge Scores</label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {judges.map((judge) => {
                        const existing = editScore.judge_scores.find((js) => js.judge_id === judge.id)
                        return (
                          <div key={judge.id} className="p-3 bg-secondary rounded-lg">
                            <div className="text-sm font-medium mb-2">{judge.name}</div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={existing?.score || ""}
                              placeholder="Score"
                              className="w-full p-2 bg-background rounded border border-border text-sm"
                              onChange={(e) =>
                                updateJudgeScore(judge.id, Number(e.target.value), judge.expertise, true)
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditScore(null)
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${team?.color}20` }}
                    >
                      <Trophy size={20} style={{ color: team?.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold">{team?.name}</h4>
                      <p className="text-sm text-muted-foreground">{event?.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4">
                      {score.judge_scores?.map((js, i) => {
                        const judge = getJudge(js.judge_id)
                        return (
                          <div key={i} className="text-center">
                            <div className="text-xs text-muted-foreground">{judge?.name?.split(" ")[0]}</div>
                            <div className="font-semibold">{js.score}</div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-right mr-4">
                      <div className="text-2xl font-black" style={{ color: team?.color }}>
                        {score.total_score}
                      </div>
                      <div className="text-xs text-muted-foreground">TOTAL</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(score)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
