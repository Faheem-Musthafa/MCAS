"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trophy, Loader2, Medal, Flame, Crown, TrendingUp } from "lucide-react"
import type { DbTeam, DbResultWithTeam } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function ScoreboardSection() {
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [recentResults, setRecentResults] = useState<DbResultWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<DbTeam | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsRes, resultsRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/results"),
        ])

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json()
          setTeams(teamsData)
          if (teamsData.length > 0) {
            setSelectedTeam(teamsData[0])
          }
        }
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setRecentResults(resultsData.slice(0, 10))
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Poll for updates every 15 seconds
    const interval = setInterval(async () => {
      try {
        const [teamsRes, resultsRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/results"),
        ])
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json()
          setTeams(teamsData)
        }
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setRecentResults(resultsData.slice(0, 10))
        }
      } catch (error) {
        console.error("Failed to fetch updates:", error)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive((prev) => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Sort teams by total points
  const rankedTeams = [...teams].sort((a, b) => b.total_points - a.total_points)

  if (loading) {
    return (
      <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden bg-background">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
        </div>
      </section>
    )
  }

  return (
    <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent/10 rounded-full opacity-50" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent/5 rounded-full opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-accent font-black text-2xl tracking-tighter">{FEST_CONFIG.name}</div>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 bg-accent/20 rounded ${isLive ? "opacity-100" : "opacity-70"}`}
              >
                <div className={`w-1.5 h-1.5 bg-accent rounded-full ${isLive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] font-bold text-accent">LIVE</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Department Standings</h2>
            <p className="text-muted-foreground mt-1">Real-time leaderboard updated automatically</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-accent">
              {teams.reduce((acc, t) => acc + t.gold + t.silver + t.bronze, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Results Declared</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Team - Left Side */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {selectedTeam ? (
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    rankedTeams[0]?.id === selectedTeam.id 
                      ? "bg-yellow-500/10 text-yellow-500" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {rankedTeams[0]?.id === selectedTeam.id && <Crown size={14} />}
                    <span className="text-sm font-bold">
                      #{rankedTeams.findIndex(t => t.id === selectedTeam.id) + 1}
                    </span>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                </div>

                {/* Team Logo */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl opacity-30"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-border">
                    <Image
                      src={selectedTeam.logo || "/placeholder.svg"}
                      alt={selectedTeam.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Team Info */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-black mb-1">{selectedTeam.short_name}</div>
                  <div className="text-lg font-semibold">{selectedTeam.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedTeam.department}</div>
                </div>

                {/* Points */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-black text-accent">{selectedTeam.total_points}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>

                {/* Medals */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <div className="text-2xl">🥇</div>
                    <div className="text-xl font-bold text-yellow-500">{selectedTeam.gold}</div>
                  </div>
                  <div className="p-3 bg-gray-500/10 rounded-xl">
                    <div className="text-2xl">🥈</div>
                    <div className="text-xl font-bold text-gray-400">{selectedTeam.silver}</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <div className="text-2xl">🥉</div>
                    <div className="text-xl font-bold text-orange-500">{selectedTeam.bronze}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Select a team to view details</p>
              </div>
            )}
          </div>

          {/* Leaderboard Table - Right Side */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-border text-xs text-muted-foreground uppercase tracking-wider bg-secondary/50">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Department</div>
                <div className="col-span-2 text-center">🥇</div>
                <div className="col-span-2 text-center">🥈</div>
                <div className="col-span-2 text-center">Points</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {rankedTeams.map((team, index) => {
                  const isSelected = selectedTeam?.id === team.id
                  const isFirst = index === 0
                  const isSecond = index === 1
                  const isThird = index === 2

                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`relative w-full grid grid-cols-12 gap-2 px-6 py-4 transition-all duration-300 text-left group ${
                        isSelected ? "bg-accent/5" : "hover:bg-secondary/50"
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}

                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        {isFirst ? (
                          <span className="text-xl">🥇</span>
                        ) : isSecond ? (
                          <span className="text-xl">🥈</span>
                        ) : isThird ? (
                          <span className="text-xl">🥉</span>
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: team.color + "20", color: team.color }}
                        >
                          {team.short_name}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold truncate ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                              {team.name}
                            </span>
                            {isFirst && <Flame size={14} className="text-accent shrink-0" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{team.department}</span>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="font-bold text-yellow-500">{team.gold}</span>
                      </div>

                      {/* Silver */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="font-bold text-gray-400">{team.silver}</span>
                      </div>

                      {/* Points */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`text-xl font-bold tabular-nums ${isSelected ? "text-accent" : "text-foreground"}`}>
                          {team.total_points}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {rankedTeams.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Trophy size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No teams registered yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <div className="mt-6 bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent" />
                  <h3 className="font-semibold">Recent Results</h3>
                </div>
                <div className="divide-y divide-border max-h-64 overflow-y-auto">
                  {recentResults.map((result) => (
                    <div key={result.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {result.position === "1st" ? "🥇" : result.position === "2nd" ? "🥈" : result.position === "3rd" ? "🥉" : "🎖️"}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{result.team?.name || "Team"}</div>
                          <div className="text-xs text-muted-foreground">{result.event?.title || "Event"}</div>
                        </div>
                      </div>
                      <span className="font-bold text-accent">+{result.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
