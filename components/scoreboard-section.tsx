"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trophy, Star, Zap, Medal, Flame } from "lucide-react"
import { initialEvents, initialTeams, initialScores, initialJudges, type Team, type Score } from "@/lib/data"

export function ScoreboardSection() {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0].id)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [animatedScores, setAnimatedScores] = useState<{ [key: number]: number }>({})
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const savedScores = localStorage.getItem("mcas-scores")
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }

    // Listen for storage changes (when admin approves scores)
    const handleStorageChange = () => {
      const updated = localStorage.getItem("mcas-scores")
      if (updated) setScores(JSON.parse(updated))
    }
    window.addEventListener("storage", handleStorageChange)

    // Poll for updates every 5 seconds for same-tab updates
    const interval = setInterval(() => {
      const updated = localStorage.getItem("mcas-scores")
      if (updated) setScores(JSON.parse(updated))
    }, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const currentEvent = initialEvents.find((e) => e.id === selectedEvent)

  const eventScores = scores
    .filter((s) => s.eventId === selectedEvent && s.status === "approved")
    .sort((a, b) => b.totalScore - a.totalScore)

  const getTeam = (teamId: number) => initialTeams.find((t) => t.id === teamId)

  // Set first team as selected when event changes
  useEffect(() => {
    if (eventScores.length > 0) {
      const firstTeam = getTeam(eventScores[0].teamId)
      setSelectedTeam(firstTeam || null)
    } else {
      setSelectedTeam(null)
    }
  }, [selectedEvent, scores])

  useEffect(() => {
    const newScores: { [key: number]: number } = {}
    eventScores.forEach((score) => {
      newScores[score.id] = 0
    })
    setAnimatedScores(newScores)

    const timeout = setTimeout(() => {
      const finalScores: { [key: number]: number } = {}
      eventScores.forEach((score) => {
        finalScores[score.id] = score.totalScore
      })
      setAnimatedScores(finalScores)
    }, 100)

    return () => clearTimeout(timeout)
  }, [selectedEvent, scores])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive((prev) => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />

      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent/10 rounded-full" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-accent/5 rounded-full" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent/[0.03] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header with MCAS Logo and Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="text-accent font-black text-2xl tracking-tighter font-serif">MCAS</div>
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 bg-accent/20 rounded ${isLive ? "opacity-100" : "opacity-70"}`}
            >
              <div className={`w-1.5 h-1.5 bg-accent rounded-full ${isLive ? "animate-pulse" : ""}`} />
              <span className="text-[10px] font-bold text-accent">LIVE</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2 md:pb-0">
            {initialEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-lg ${
                  selectedEvent === event.id
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {event.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Grid - F1 Style */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0">
          {/* Left Side - Featured Team */}
          <div className="relative flex flex-col justify-center items-center lg:items-start">
            {selectedTeam ? (
              <>
                <div className="relative z-10 text-center lg:text-left mb-8">
                  <h2 className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter leading-none gradient-text uppercase font-serif">
                    {selectedTeam.name.split(" ")[0]}
                  </h2>
                  <h3
                    className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none uppercase text-accent/80"
                    style={{
                      WebkitTextStroke: "1px currentColor",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {selectedTeam.name.split(" ").slice(1).join(" ") || selectedTeam.department}
                  </h3>
                </div>

                <div className="relative w-72 h-72 md:w-96 md:h-96">
                  <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
                  <div className="absolute inset-4 rounded-full border border-accent/20" />

                  {/* Accent line */}
                  <div className="absolute left-0 top-1/2 w-full h-0.5 -translate-y-1/2 bg-gradient-to-r from-accent to-transparent opacity-50" />

                  {/* Team logo/image with glass effect */}
                  <div className="absolute inset-8 rounded-full overflow-hidden glass">
                    <Image
                      src={selectedTeam.logo || "/placeholder.svg"}
                      alt={selectedTeam.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <div className="w-6 h-4 rounded-sm flex items-center justify-center bg-accent/20 border border-accent/40">
                    {selectedTeam.category === "SPORTS" ? (
                      <Zap size={10} className="text-accent" />
                    ) : (
                      <Star size={10} className="text-accent" />
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm">{selectedTeam.department}</span>
                </div>
              </>
            ) : (
              <div className="text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-muted-foreground/30 uppercase font-serif">
                  Awaiting
                </h2>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-muted-foreground/20 uppercase">
                  Results
                </h3>
                <p className="mt-6 text-muted-foreground text-sm">Scores are pending approval from administrators.</p>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Team</div>
              <div className="col-span-2 text-center">Points</div>
              <div className="col-span-2 text-center">Wins</div>
              <div className="col-span-2 text-center">Podiums</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {eventScores.map((score, index) => {
                const team = getTeam(score.teamId)
                if (!team) return null

                const isSelected = selectedTeam?.id === team.id
                const isFirst = index === 0
                const isSecond = index === 1
                const isThird = index === 2
                const animatedScore = animatedScores[score.id] || 0

                return (
                  <button
                    key={score.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`relative w-full grid grid-cols-12 gap-4 px-6 py-5 transition-all duration-300 text-left group ${
                      isSelected ? "bg-accent/5" : "hover:bg-secondary/50"
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}

                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`text-xl font-bold ${
                          isFirst
                            ? "text-accent"
                            : isSecond
                              ? "text-muted-foreground"
                              : isThird
                                ? "text-accent/60"
                                : "text-muted-foreground/50"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>

                    {/* Team Info */}
                    <div className="col-span-5 flex items-center gap-4">
                      {/* Category Badge */}
                      <div className="w-8 h-6 rounded flex items-center justify-center shrink-0 bg-accent/10 border border-accent/20">
                        {team.category === "SPORTS" ? (
                          <Zap size={12} className="text-accent" />
                        ) : (
                          <Star size={12} className="text-accent" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold truncate transition-colors ${
                              isSelected ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                            }`}
                          >
                            {team.name}
                          </span>
                          {isFirst && <Flame size={14} className="text-accent shrink-0" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{team.department}</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span
                        className={`text-xl font-bold tabular-nums transition-all duration-700 ${
                          isSelected ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {animatedScore}
                      </span>
                    </div>

                    {/* Wins */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">{team.wins}</span>
                    </div>

                    {/* Podiums */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">{team.podiums}</span>
                    </div>
                  </button>
                )
              })}

              {eventScores.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Trophy size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No approved scores for this event yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Scores are pending administrator approval.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <Medal className="text-accent" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Expert Judges Panel</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {initialJudges.map((judge) => (
              <div
                key={judge.id}
                className="group relative glass rounded-xl p-4 hover:bg-accent/5 hover:border-accent/20 transition-all"
              >
                <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-accent/30 transition-all">
                  <Image src={judge.image || "/placeholder.svg"} alt={judge.name} fill className="object-cover" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-foreground text-sm truncate">{judge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{judge.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
