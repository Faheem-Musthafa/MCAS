"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trophy, Loader2, Flame, Crown, TrendingUp } from "lucide-react"
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
      <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden bg-radial-pastel">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--art-accent)]" />
        </div>
      </section>
    )
  }

  return (
    <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden">
      {/* Pastel background decorations */}
      <div className="absolute inset-0 bg-radial-pastel" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-pink absolute top-0 -left-40 w-[300px] h-[300px] opacity-30" style={{ animationDelay: '1s' }} />
        <div className="blob blob-blue absolute bottom-0 -right-40 w-[350px] h-[350px] opacity-30" style={{ animationDelay: '3s' }} />
        <div className="blob blob-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="gradient-text font-black text-2xl tracking-tighter">{FEST_CONFIG.name}</div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isLive ? "opacity-100" : "opacity-70"}`}
                style={{ background: 'rgba(255, 143, 171, 0.2)', border: '1px solid rgba(255, 143, 171, 0.4)' }}
              >
                <div className={`w-2 h-2 bg-[var(--art-accent)] rounded-full ${isLive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] font-bold text-[var(--art-accent)]">LIVE</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--art-text)]">Group Standings</h2>
            <p className="text-[var(--art-text-light)] mt-1">Real-time leaderboard updated automatically</p>
          </div>
          <div className="glass-card text-right p-4 rounded-2xl">
            <div className="text-4xl font-bold gradient-text">
              {teams.reduce((acc, t) => acc + t.gold + t.silver + t.bronze, 0)}
            </div>
            <div className="text-sm text-[var(--art-text-light)]">Results Declared</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Team - Left Side */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {selectedTeam ? (
              <div className="glass-card rounded-3xl p-6 sticky top-24">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    rankedTeams[0]?.id === selectedTeam.id 
                      ? "text-amber-600" 
                      : "text-[var(--art-text-light)]"
                  }`}
                  style={{ 
                    background: rankedTeams[0]?.id === selectedTeam.id 
                      ? 'rgba(255, 245, 186, 0.7)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    border: rankedTeams[0]?.id === selectedTeam.id
                      ? '1px solid rgba(255, 214, 0, 0.5)'
                      : '1px solid rgba(0, 0, 0, 0.08)'
                  }}
                  >
                    {rankedTeams[0]?.id === selectedTeam.id && <Crown size={14} />}
                    <span className="text-sm font-bold">
                      #{rankedTeams.findIndex(t => t.id === selectedTeam.id) + 1}
                    </span>
                  </div>
                  <div 
                    className="w-5 h-5 rounded-full ring-2 ring-white shadow-lg"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                </div>

                {/* Team Logo */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl opacity-40"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
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
                  <div className="text-3xl font-black mb-1 text-[var(--art-text)]">{selectedTeam.short_name}</div>
                  <div className="text-lg font-semibold text-[var(--art-text)]">{selectedTeam.name}</div>
                  <div className="text-sm text-[var(--art-text-light)]">{selectedTeam.department}</div>
                </div>

                {/* Points */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-black gradient-text">{selectedTeam.total_points}</div>
                  <div className="text-sm text-[var(--art-text-light)]">Total Points</div>
                </div>

                {/* Medals */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(255, 245, 186, 0.7)' }}>
                    <div className="text-2xl">🥇</div>
                    <div className="text-xl font-bold text-amber-600">{selectedTeam.gold}</div>
                  </div>
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(193, 225, 255, 0.7)' }}>
                    <div className="text-2xl">🥈</div>
                    <div className="text-xl font-bold text-gray-500">{selectedTeam.silver}</div>
                  </div>
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(255, 209, 220, 0.7)' }}>
                    <div className="text-2xl">🥉</div>
                    <div className="text-xl font-bold text-orange-500">{selectedTeam.bronze}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-6 text-center">
                <Trophy size={48} className="mx-auto text-[var(--art-text-light)] mb-4" />
                <p className="text-[var(--art-text-light)]">Select a team to view details</p>
              </div>
            )}
          </div>

          {/* Leaderboard Table - Right Side */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="glass-card rounded-3xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-4 text-xs text-[var(--art-text-light)] uppercase tracking-wider" style={{ background: 'rgba(255, 255, 255, 0.5)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <div className="col-span-1">#</div>
                <div className="col-span-5">Department</div>
                <div className="col-span-2 text-center">🥇</div>
                <div className="col-span-2 text-center">🥈</div>
                <div className="col-span-2 text-center">Points</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
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
                        isSelected ? "" : "hover:bg-white/50"
                      }`}
                      style={{ background: isSelected ? 'rgba(255, 143, 171, 0.1)' : 'transparent' }}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--art-accent)]" />}

                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        {isFirst ? (
                          <span className="text-xl">🥇</span>
                        ) : isSecond ? (
                          <span className="text-xl">🥈</span>
                        ) : isThird ? (
                          <span className="text-xl">🥉</span>
                        ) : (
                          <span className="text-lg font-bold text-[var(--art-text-light)]">{index + 1}</span>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                          style={{ backgroundColor: team.color + "30", color: team.color }}
                        >
                          {team.short_name}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold truncate text-[var(--art-text)]`}>
                              {team.name}
                            </span>
                            {isFirst && <Flame size={14} className="text-[var(--art-accent)] shrink-0" />}
                          </div>
                          <span className="text-xs text-[var(--art-text-light)]">{team.department}</span>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="font-bold text-amber-500">{team.gold}</span>
                      </div>

                      {/* Silver */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="font-bold text-gray-400">{team.silver}</span>
                      </div>

                      {/* Points */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`text-xl font-bold tabular-nums ${isSelected ? "gradient-text" : "text-[var(--art-text)]"}`}>
                          {team.total_points}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {rankedTeams.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Trophy size={32} className="mx-auto text-[var(--art-text-light)] mb-3" />
                    <p className="text-[var(--art-text-light)]">No teams registered yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <div className="mt-6 glass-card rounded-3xl overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <TrendingUp size={16} className="text-[var(--art-accent)]" />
                  <h3 className="font-semibold text-[var(--art-text)]">Recent Results</h3>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                  {recentResults.map((result) => (
                    <div key={result.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {result.position === "1st" ? "🥇" : result.position === "2nd" ? "🥈" : result.position === "3rd" ? "🥉" : "🎖️"}
                        </span>
                        <div>
                          <div className="font-medium text-sm text-[var(--art-text)]">{result.team?.name || "Team"}</div>
                          <div className="text-xs text-[var(--art-text-light)]">{result.event?.title || "Event"}</div>
                        </div>
                      </div>
                      <span className="font-bold gradient-text">+{result.points}</span>
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
