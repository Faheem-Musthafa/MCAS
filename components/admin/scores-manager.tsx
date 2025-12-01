"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Save, X, Trophy } from "lucide-react"
import { initialScores, initialTeams, initialEvents, initialJudges, type Score } from "@/lib/data"

export function ScoresManager() {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newScore, setNewScore] = useState<Partial<Score>>({
    eventId: initialEvents[0]?.id,
    teamId: initialTeams[0]?.id,
    judgeScores: [],
    totalScore: 0,
  })
  const [editScore, setEditScore] = useState<Score | null>(null)

  const getTeam = (teamId: number) => initialTeams.find((t) => t.id === teamId)
  const getEvent = (eventId: number) => initialEvents.find((e) => e.id === eventId)
  const getJudge = (judgeId: number) => initialJudges.find((j) => j.id === judgeId)

  const handleAdd = () => {
    if (!newScore.eventId || !newScore.teamId) return
    const score: Score = {
      id: Date.now(),
      eventId: newScore.eventId,
      teamId: newScore.teamId,
      judgeScores: newScore.judgeScores || [],
      totalScore: newScore.judgeScores?.reduce((sum, js) => sum + js.score, 0) || 0,
    }
    setScores([...scores, score])
    setNewScore({ eventId: initialEvents[0]?.id, teamId: initialTeams[0]?.id, judgeScores: [], totalScore: 0 })
    setIsAdding(false)
  }

  const handleEdit = (score: Score) => {
    setEditingId(score.id)
    setEditScore({ ...score })
  }

  const handleSave = () => {
    if (!editScore) return
    editScore.totalScore = editScore.judgeScores.reduce((sum, js) => sum + js.score, 0)
    setScores(scores.map((s) => (s.id === editScore.id ? editScore : s)))
    setEditingId(null)
    setEditScore(null)
  }

  const handleDelete = (id: number) => {
    setScores(scores.filter((s) => s.id !== id))
  }

  const updateJudgeScore = (judgeId: number, score: number, criteria: string, isEdit: boolean) => {
    if (isEdit && editScore) {
      const existing = editScore.judgeScores.findIndex((js) => js.judgeId === judgeId)
      const updated = [...editScore.judgeScores]
      if (existing >= 0) {
        updated[existing] = { judgeId, score, criteria }
      } else {
        updated.push({ judgeId, score, criteria })
      }
      setEditScore({ ...editScore, judgeScores: updated })
    } else {
      const existing = (newScore.judgeScores || []).findIndex((js) => js.judgeId === judgeId)
      const updated = [...(newScore.judgeScores || [])]
      if (existing >= 0) {
        updated[existing] = { judgeId, score, criteria }
      } else {
        updated.push({ judgeId, score, criteria })
      }
      setNewScore({ ...newScore, judgeScores: updated })
    }
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
                value={newScore.eventId}
                onChange={(e) => setNewScore({ ...newScore, eventId: Number(e.target.value) })}
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              >
                {initialEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Team</label>
              <select
                value={newScore.teamId}
                onChange={(e) => setNewScore({ ...newScore, teamId: Number(e.target.value) })}
                className="w-full p-3 bg-secondary rounded-lg border border-border focus:border-accent outline-none"
              >
                {initialTeams.map((team) => (
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
              {initialJudges.map((judge) => (
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
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium"
            >
              <Save size={16} />
              Save Score
            </button>
          </div>
        </div>
      )}

      {/* Scores List */}
      <div className="space-y-4">
        {scores.map((score) => {
          const team = getTeam(score.teamId)
          const event = getEvent(score.eventId)
          const isEditing = editingId === score.id

          return (
            <div key={score.id} className="p-6 bg-card rounded-xl border border-border">
              {isEditing && editScore ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Event</label>
                      <select
                        value={editScore.eventId}
                        onChange={(e) => setEditScore({ ...editScore, eventId: Number(e.target.value) })}
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                      >
                        {initialEvents.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Team</label>
                      <select
                        value={editScore.teamId}
                        onChange={(e) => setEditScore({ ...editScore, teamId: Number(e.target.value) })}
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                      >
                        {initialTeams.map((team) => (
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
                      {initialJudges.map((judge) => {
                        const existing = editScore.judgeScores.find((js) => js.judgeId === judge.id)
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
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium"
                    >
                      <Save size={16} />
                      Save
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
                      {score.judgeScores.map((js, i) => {
                        const judge = getJudge(js.judgeId)
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
                        {score.totalScore}
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
