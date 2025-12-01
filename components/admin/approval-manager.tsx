"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckCircle2, XCircle, Clock, User, Calendar, Trophy, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import type { DbEvent, DbTeam, DbJudge, DbScore, DbJudgeScore } from "@/lib/supabase/types"

interface ScoreWithJudgeScores extends DbScore {
  judge_scores: DbJudgeScore[]
}

export function ApprovalManager() {
  const [scores, setScores] = useState<ScoreWithJudgeScores[]>([])
  const [events, setEvents] = useState<DbEvent[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [judges, setJudges] = useState<DbJudge[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [expandedScore, setExpandedScore] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [scoresRes, eventsRes, teamsRes, judgesRes] = await Promise.all([
        fetch("/api/scores"),
        fetch("/api/events"),
        fetch("/api/teams"),
        fetch("/api/judges"),
      ])
      if (scoresRes.ok) setScores(await scoresRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (teamsRes.ok) setTeams(await teamsRes.json())
      if (judgesRes.ok) setJudges(await judgesRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (scoreId: string) => {
    setProcessing(scoreId)
    try {
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (res.ok) {
        setScores(scores.map((s) => (s.id === scoreId ? { ...s, status: "approved" as const } : s)))
      }
    } catch (error) {
      console.error("Failed to approve score:", error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (scoreId: string) => {
    setProcessing(scoreId)
    try {
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (res.ok) {
        setScores(scores.map((s) => (s.id === scoreId ? { ...s, status: "rejected" as const } : s)))
      }
    } catch (error) {
      console.error("Failed to reject score:", error)
    } finally {
      setProcessing(null)
    }
  }

  const handleBulkApprove = async () => {
    const pendingScores = scores.filter((s) => s.status === "pending")
    for (const score of pendingScores) {
      await handleApprove(score.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  const filteredScores = scores.filter((s) => (filter === "all" ? true : s.status === filter))

  const pendingCount = scores.filter((s) => s.status === "pending").length
  const approvedCount = scores.filter((s) => s.status === "approved").length
  const rejectedCount = scores.filter((s) => s.status === "rejected").length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-500/80">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500/50" />
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500/80">Approved</p>
              <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500/50" />
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-500/80">Rejected</p>
              <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500/50" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === status
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {pendingCount > 0 && (
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-green-500/10 text-green-500 text-sm font-medium rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Approve All Pending ({pendingCount})
          </button>
        )}
      </div>

      {/* Scores List */}
      <div className="space-y-3">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No {filter !== "all" ? filter : ""} scores found</p>
          </div>
        ) : (
          filteredScores.map((score) => {
            const event = events.find((e) => e.id === score.event_id)
            const team = teams.find((t) => t.id === score.team_id)
            const submitter = judges.find((j) => j.id === score.submitted_by)
            const isExpanded = expandedScore === score.id

            return (
              <div key={score.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Main Row */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedScore(isExpanded ? null : score.id)}
                >
                  {/* Team Logo */}
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0"
                    style={{ borderColor: team?.color }}
                  >
                    <Image
                      src={team?.logo || "/placeholder.svg"}
                      alt={team?.name || "Team"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{team?.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          score.status === "approved"
                            ? "bg-green-500/10 text-green-500"
                            : score.status === "rejected"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {score.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Trophy size={12} />
                        {event?.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {submitter?.name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(score.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-accent">{score.total_score}</p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </div>

                  {/* Expand Icon */}
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border bg-secondary/20">
                    <div className="pt-4 space-y-4">
                      {/* Judge Scores Breakdown */}
                      <div>
                        <p className="text-sm font-medium mb-3">Score Breakdown</p>
                        <div className="grid gap-2">
                          {score.judge_scores?.map((js, idx) => {
                            const judge = judges.find((j) => j.id === js.judge_id)
                            return (
                              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                      src={judge?.image || "/placeholder.svg"}
                                      alt={judge?.name || "Judge"}
                                      width={32}
                                      height={32}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{judge?.name}</p>
                                    <p className="text-xs text-muted-foreground">{js.criteria}</p>
                                  </div>
                                </div>
                                <p className="text-lg font-bold">{js.score}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      {score.status === "pending" && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(score.id)
                            }}
                            disabled={processing === score.id}
                            className="flex-1 py-3 bg-green-500/10 text-green-500 font-medium rounded-xl hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processing === score.id ? (
                              <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(score.id)
                            }}
                            disabled={processing === score.id}
                            className="flex-1 py-3 bg-red-500/10 text-red-500 font-medium rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processing === score.id ? (
                              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <>
                                <XCircle size={18} />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
