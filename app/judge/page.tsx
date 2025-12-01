"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock, CheckCircle2, Clock, Send, Star, Trophy, Palette, User } from "lucide-react"
import {
  initialJudges,
  initialEvents,
  initialTeams,
  initialScores,
  scoringCriteria,
  type Judge,
  type Score,
} from "@/lib/data"

export default function JudgePanelPage() {
  const [accessCode, setAccessCode] = useState("")
  const [judge, setJudge] = useState<Judge | null>(null)
  const [judges, setJudges] = useState(initialJudges)
  const [events] = useState(initialEvents)
  const [teams] = useState(initialTeams)
  const [scores, setScores] = useState(initialScores)
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Load saved data
  useEffect(() => {
    const savedScores = localStorage.getItem("mcas-scores")
    const savedJudges = localStorage.getItem("mcas-judges")
    if (savedScores) setScores(JSON.parse(savedScores))
    if (savedJudges) setJudges(JSON.parse(savedJudges))
  }, [])

  const handleLogin = () => {
    const foundJudge = judges.find((j) => j.accessCode === accessCode.toUpperCase())
    if (foundJudge) {
      setJudge(foundJudge)
      setError("")
    } else {
      setError("Invalid access code. Please try again.")
    }
  }

  const getEventCriteria = (eventId: number) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return []
    return scoringCriteria.filter((c) => c.category === event.category)
  }

  const getEventTeams = (eventId: number) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return []
    return teams.filter((t) => t.category === event.category)
  }

  const hasAlreadyScored = (eventId: number, teamId: number) => {
    if (!judge) return false
    return scores.some(
      (s) => s.eventId === eventId && s.teamId === teamId && s.judgeScores.some((js) => js.judgeId === judge.id),
    )
  }

  const handleSubmitScore = () => {
    if (!judge || !selectedEvent || !selectedTeam) return

    const criteria = getEventCriteria(selectedEvent)
    const allScoresFilled = criteria.every((c) => criteriaScores[c.id] !== undefined)

    if (!allScoresFilled) {
      setError("Please fill in all criteria scores.")
      return
    }

    setSubmitting(true)

    // Create judge scores array
    const judgeScoreEntries = criteria.map((c) => ({
      judgeId: judge.id,
      score: criteriaScores[c.id],
      criteria: c.name,
    }))

    const totalScore = judgeScoreEntries.reduce((sum, js) => sum + js.score, 0)

    // Check if there's an existing score for this event/team
    const existingScoreIndex = scores.findIndex((s) => s.eventId === selectedEvent && s.teamId === selectedTeam)

    let newScores: Score[]

    if (existingScoreIndex >= 0) {
      // Add to existing score
      newScores = [...scores]
      newScores[existingScoreIndex] = {
        ...newScores[existingScoreIndex],
        judgeScores: [...newScores[existingScoreIndex].judgeScores, ...judgeScoreEntries],
        totalScore: newScores[existingScoreIndex].totalScore + totalScore,
        status: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: judge.id,
      }
    } else {
      // Create new score
      const newScore: Score = {
        id: Math.max(...scores.map((s) => s.id), 0) + 1,
        eventId: selectedEvent,
        teamId: selectedTeam,
        judgeScores: judgeScoreEntries,
        totalScore,
        status: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: judge.id,
      }
      newScores = [...scores, newScore]
    }

    setScores(newScores)
    localStorage.setItem("mcas-scores", JSON.stringify(newScores))

    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setCriteriaScores({})
      setSelectedTeam(null)

      setTimeout(() => setSubmitted(false), 3000)
    }, 1500)
  }

  // Login Screen
  if (!judge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Judge Panel</h1>
            <p className="text-muted-foreground">Enter your access code to continue</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Access Code</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your code (e.g., JUDGE001)"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-center text-lg tracking-widest"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors"
            >
              Access Panel
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Website
            </Link>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Contact the administrator if you don&apos;t have an access code.
          </p>
        </div>
      </div>
    )
  }

  // Main Judge Panel
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold">Judge Panel</h1>
              <p className="text-sm text-muted-foreground">11th Student Union MCAS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{judge.name}</p>
              <p className="text-xs text-muted-foreground">{judge.expertise}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent overflow-hidden">
              <Image
                src={judge.image || "/placeholder.svg"}
                alt={judge.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Success Toast */}
        {submitted && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl backdrop-blur-sm animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-medium">Score submitted successfully! Awaiting admin approval.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Event Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Select Event
              </h2>
              <div className="space-y-2">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event.id)
                      setSelectedTeam(null)
                      setCriteriaScores({})
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedEvent === event.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          event.category === "ART" ? "bg-purple-500/20" : "bg-orange-500/20"
                        }`}
                      >
                        {event.category === "ART" ? (
                          <Palette className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Trophy className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.venue}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* My Submissions */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                My Submissions
              </h2>
              <div className="space-y-3">
                {scores
                  .filter((s) => s.judgeScores.some((js) => js.judgeId === judge.id))
                  .slice(-5)
                  .reverse()
                  .map((score) => {
                    const event = events.find((e) => e.id === score.eventId)
                    const team = teams.find((t) => t.id === score.teamId)
                    return (
                      <div key={score.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium">{team?.name}</p>
                          <p className="text-xs text-muted-foreground">{event?.title}</p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            score.status === "approved"
                              ? "bg-green-500/10 text-green-500"
                              : score.status === "rejected"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {score.status === "approved" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {score.status.charAt(0).toUpperCase() + score.status.slice(1)}
                        </div>
                      </div>
                    )
                  })}
                {scores.filter((s) => s.judgeScores.some((js) => js.judgeId === judge.id)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No submissions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Team Selection & Scoring */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEvent ? (
              <>
                {/* Team Selection */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Select Team to Evaluate
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {getEventTeams(selectedEvent).map((team) => {
                      const alreadyScored = hasAlreadyScored(selectedEvent, team.id)
                      return (
                        <button
                          key={team.id}
                          onClick={() => {
                            if (!alreadyScored) {
                              setSelectedTeam(team.id)
                              setCriteriaScores({})
                            }
                          }}
                          disabled={alreadyScored}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            alreadyScored
                              ? "border-green-500/30 bg-green-500/5 opacity-60 cursor-not-allowed"
                              : selectedTeam === team.id
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl overflow-hidden border-2"
                              style={{ borderColor: team.color }}
                            >
                              <Image
                                src={team.logo || "/placeholder.svg"}
                                alt={team.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">{team.department}</p>
                            </div>
                            {alreadyScored && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Scoring Panel */}
                {selectedTeam && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-accent" />
                        Score Evaluation
                      </h2>
                      <div className="px-3 py-1 bg-accent/10 rounded-full">
                        <span className="text-sm font-medium text-accent">
                          Total: {Object.values(criteriaScores).reduce((a, b) => a + b, 0)} pts
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {getEventCriteria(selectedEvent).map((criteria) => (
                        <div key={criteria.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-medium">{criteria.name}</label>
                            <span className="text-sm text-muted-foreground">
                              {criteriaScores[criteria.id] || 0} / {criteria.maxScore}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max={criteria.maxScore}
                              value={criteriaScores[criteria.id] || 0}
                              onChange={(e) =>
                                setCriteriaScores({
                                  ...criteriaScores,
                                  [criteria.id]: Number.parseInt(e.target.value),
                                })
                              }
                              className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
                            />
                            <input
                              type="number"
                              min="0"
                              max={criteria.maxScore}
                              value={criteriaScores[criteria.id] || ""}
                              onChange={(e) => {
                                const val = Number.parseInt(e.target.value)
                                if (!isNaN(val) && val >= 0 && val <= criteria.maxScore) {
                                  setCriteriaScores({
                                    ...criteriaScores,
                                    [criteria.id]: val,
                                  })
                                }
                              }}
                              className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>

                          {/* Visual Score Bar */}
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-300"
                              style={{ width: `${((criteriaScores[criteria.id] || 0) / criteria.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

                    <button
                      onClick={handleSubmitScore}
                      disabled={submitting}
                      className="w-full mt-6 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Score for Approval
                        </>
                      )}
                    </button>

                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Scores will be reviewed by an administrator before being added to the leaderboard.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
                <p className="text-muted-foreground">Choose an event from the left panel to start evaluating teams.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
