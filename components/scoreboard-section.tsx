"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2, Flame, Crown, TrendingUp, Zap, Medal, Sparkles } from "lucide-react"
import type { DbTeam, DbResultWithTeam } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function ScoreboardSection() {
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [recentResults, setRecentResults] = useState<DbResultWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<DbTeam | null>(null)
  const [animatedPoints, setAnimatedPoints] = useState<Record<string, number>>({})

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
          // Initialize animated points
          const points: Record<string, number> = {}
          teamsData.forEach((t: DbTeam) => { points[t.id] = t.total_points })
          setAnimatedPoints(points)
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

  // Get rank badge styling
  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: '0 4px 20px rgba(255, 215, 0, 0.4)' }
    if (index === 1) return { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', shadow: '0 4px 20px rgba(192, 192, 192, 0.4)' }
    if (index === 2) return { bg: 'linear-gradient(135deg, #CD7F32, #B87333)', shadow: '0 4px 20px rgba(205, 127, 50, 0.4)' }
    return { bg: 'rgba(255, 255, 255, 0.5)', shadow: 'none' }
  }

  if (loading) {
    return (
      <section id="scoreboard" className="py-20 md:py-32 relative overflow-hidden bg-radial-pastel">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--art-pink)] to-[var(--art-purple)] blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 animate-spin text-[var(--art-accent)]" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="scoreboard" className="py-16 md:py-32 relative overflow-hidden bg-transparent">
      {/* Floating elements for seamless feel - hidden on mobile */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-[350px] h-[350px] rounded-full bg-[var(--art-pink)]/20 blur-[80px] animate-float-gentle" />
        <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] rounded-full bg-[var(--art-blue)]/20 blur-[80px] animate-float-gentle animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-14 gap-4 md:gap-6">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="gradient-text font-black text-lg md:text-2xl tracking-tighter">{FEST_CONFIG.name}</div>
              <div
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full transition-all duration-300 ${isLive ? "shadow-lg" : "shadow-md"}`}
                style={{ 
                  background: isLive ? 'linear-gradient(135deg, rgba(255, 143, 171, 0.3), rgba(255, 143, 171, 0.1))' : 'rgba(255, 143, 171, 0.1)', 
                  border: '1px solid rgba(255, 143, 171, 0.4)' 
                }}
              >
                <div className={`w-2 h-2 rounded-full ${isLive ? "animate-pulse shadow-lg" : ""}`} style={{ background: 'var(--art-accent)', boxShadow: isLive ? '0 0 10px var(--art-accent)' : 'none' }} />
                <span className="text-[10px] md:text-xs font-bold text-[var(--art-accent)]">LIVE</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-1 md:mb-2">
              Group <span className="gradient-text">Standings</span>
            </h2>
            <p className="text-xs md:text-base text-muted-foreground flex items-center gap-1.5 md:gap-2">
              <Zap size={12} className="text-[var(--art-accent)]" />
              Real-time leaderboard
            </p>
          </div>
          <div className="glass-card text-center p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl">
            <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-1 md:mb-2">
              <Medal size={18} className="md:hidden text-[var(--art-accent)]" />
              <Medal size={24} className="hidden md:block text-[var(--art-accent)]" />
            </div>
            <div className="text-3xl md:text-5xl font-black gradient-text mb-0.5 md:mb-1">
              {teams.reduce((acc, t) => acc + t.gold + t.silver + t.bronze, 0)}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium">Results</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Featured Team - Hidden on mobile, shown below on tablet */}
          <div className="hidden lg:block lg:col-span-1 order-2 lg:order-1">
            {selectedTeam ? (
              <div 
                className="glass-card rounded-3xl p-6 md:p-8 sticky top-24 shadow-xl overflow-hidden"
                style={{ borderTop: `4px solid ${selectedTeam.color}` }}
              >
                {/* Team Color Background Glow */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${selectedTeam.color}, transparent)` }}
                />
                
                {/* Rank Badge */}
                <div className="relative flex items-center justify-between mb-8">
                  <div 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg`}
                    style={{ 
                      background: getRankStyle(rankedTeams.findIndex(t => t.id === selectedTeam.id)).bg,
                      boxShadow: getRankStyle(rankedTeams.findIndex(t => t.id === selectedTeam.id)).shadow
                    }}
                  >
                    {rankedTeams[0]?.id === selectedTeam.id && <Crown size={16} className="text-white" />}
                    <span className="text-sm text-white">
                      Rank #{rankedTeams.findIndex(t => t.id === selectedTeam.id) + 1}
                    </span>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl ring-2 ring-white shadow-xl flex items-center justify-center"
                    style={{ backgroundColor: selectedTeam.color, boxShadow: `0 4px 15px ${selectedTeam.color}60` }}
                  >
                    <span className="text-white text-xs font-bold">{selectedTeam.color.replace('#', '').toUpperCase().slice(0, 3)}</span>
                  </div>
                </div>

                {/* Team Color & Letter Display */}
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div 
                    className="absolute inset-0 rounded-3xl blur-3xl opacity-50 animate-pulse-glow"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                  <div 
                    className="relative w-full h-full rounded-3xl shadow-2xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedTeam.color,
                      boxShadow: `0 10px 40px ${selectedTeam.color}50`
                    }}
                  >
                    <span 
                      className="text-6xl font-black text-white drop-shadow-lg tracking-wider"
                      style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                    >
                      {selectedTeam.short_name}
                    </span>
                  </div>
                </div>

                {/* Team Info */}
                <div className="text-center mb-8">
                  <div className="text-2xl font-bold text-foreground mb-1">{selectedTeam.name}</div>
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mt-2"
                    style={{ backgroundColor: selectedTeam.color + '15', border: `1px solid ${selectedTeam.color}40` }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedTeam.color }}
                    />
                    <span className="text-xs font-bold tracking-wide" style={{ color: selectedTeam.color }}>
                      TEAM {selectedTeam.color.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Points with animation */}
                <div className="text-center mb-8 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255, 143, 171, 0.1), rgba(230, 206, 242, 0.1))' }}>
                  <div className="text-6xl font-black gradient-text animate-score-glow tabular-nums">{selectedTeam.total_points}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">Total Points</div>
                </div>

                {/* Medals */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 245, 186, 0.7))' }}>
                    <div className="text-3xl mb-1">🥇</div>
                    <div className="text-2xl font-black text-amber-600">{selectedTeam.gold}</div>
                    <div className="text-[10px] text-amber-700 font-medium">GOLD</div>
                  </div>
                  <div className="p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(193, 225, 255, 0.7))' }}>
                    <div className="text-3xl mb-1">🥈</div>
                    <div className="text-2xl font-black text-gray-500">{selectedTeam.silver}</div>
                    <div className="text-[10px] text-gray-600 font-medium">SILVER</div>
                  </div>
                  <div className="p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(255, 209, 220, 0.7))' }}>
                    <div className="text-3xl mb-1">🥉</div>
                    <div className="text-2xl font-black text-orange-500">{selectedTeam.bronze}</div>
                    <div className="text-[10px] text-orange-600 font-medium">BRONZE</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 text-center shadow-xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(230, 206, 242, 0.5)' }}>
                  <Trophy size={40} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Select a team to view details</p>
              </div>
            )}
          </div>

          {/* Leaderboard Table - Right Side */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
              {/* Table Header - Simplified on mobile */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-5 text-xs text-muted-foreground uppercase tracking-widest font-bold" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <div className="col-span-1">#</div>
                <div className="col-span-5">Team</div>
                <div className="col-span-2 text-center">🥇</div>
                <div className="col-span-2 text-center">🥈</div>
                <div className="col-span-2 text-center">Points</div>
              </div>
              
              {/* Mobile Header */}
              <div className="md:hidden px-4 py-3 text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <span>Leaderboard</span>
                <span className="flex items-center gap-2">🥇🥈🥉 Points</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y" style={{ borderColor: 'rgba(0, 0, 0, 0.03)' }}>
                {rankedTeams.map((team, index) => {
                  const isSelected = selectedTeam?.id === team.id
                  const isFirst = index === 0
                  const isSecond = index === 1
                  const isThird = index === 2
                  const isPodium = isFirst || isSecond || isThird

                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`relative w-full transition-all duration-300 md:duration-500 text-left group animate-scale-in touch-feedback ${
                        isSelected ? "" : "hover:bg-white/60 active:bg-white/70"
                      }`}
                      style={{ 
                        animationDelay: `${Math.min(index * 30, 200)}ms`,
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(255, 143, 171, 0.15), rgba(230, 206, 242, 0.1))' 
                          : isPodium 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : 'transparent' 
                      }}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 rounded-r-full bg-gradient-to-b from-[var(--art-pink)] to-[var(--art-purple)]" />}
                      
                      {/* Mobile Layout */}
                      <div className="md:hidden flex items-center gap-3 px-4 py-3">
                        {/* Rank Badge */}
                        <div className="w-8 text-center flex-shrink-0">
                          {isFirst ? (
                            <span className="text-xl">🥇</span>
                          ) : isSecond ? (
                            <span className="text-xl">🥈</span>
                          ) : isThird ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="text-sm font-black text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Team Box */}
                        <div 
                          className="w-10 h-10 rounded-xl shadow-md flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: team.color,
                            boxShadow: `0 2px 10px ${team.color}40`
                          }}
                        >
                          <span className="text-white font-black text-sm">{team.short_name}</span>
                        </div>
                        
                        {/* Team Name & Medals */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate text-foreground">{team.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">🥇{team.gold}</span>
                            <span className="flex items-center gap-0.5">🥈{team.silver}</span>
                            <span className="flex items-center gap-0.5">🥉{team.bronze}</span>
                          </div>
                        </div>
                        
                        {/* Points */}
                        <div className={`text-xl font-black tabular-nums ${isSelected ? "gradient-text" : "text-foreground"}`}>
                          {team.total_points}
                        </div>
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-5">
                        {/* Rank */}
                        <div className="col-span-1 flex items-center">
                          {isFirst ? (
                            <span className="text-2xl drop-shadow-md">🥇</span>
                          ) : isSecond ? (
                            <span className="text-2xl drop-shadow-md">🥈</span>
                          ) : isThird ? (
                            <span className="text-2xl drop-shadow-md">🥉</span>
                          ) : (
                            <span className="text-lg font-black text-muted-foreground">{index + 1}</span>
                          )}
                        </div>

                        {/* Team Info */}
                        <div className="col-span-5 flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: team.color,
                              boxShadow: `0 4px 15px ${team.color}50`
                            }}
                          >
                            <span className="text-white font-black text-lg tracking-wide drop-shadow-md">
                              {team.short_name}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold truncate text-foreground group-hover:gradient-text transition-all">
                                {team.name}
                              </span>
                              {isFirst && <Flame size={16} className="text-orange-500 animate-pulse shrink-0" />}
                              {isSecond && <Sparkles size={14} className="text-gray-400 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                              <span className="text-[11px] font-semibold tracking-wide" style={{ color: team.color }}>
                                TEAM {team.color.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Gold */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="font-black text-lg text-amber-500">{team.gold}</span>
                        </div>

                        {/* Silver */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="font-bold text-lg text-gray-400">{team.silver}</span>
                        </div>

                        {/* Points */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className={`text-2xl font-black tabular-nums transition-all duration-300 ${isSelected ? "gradient-text scale-110" : "text-foreground"}`}>
                            {team.total_points}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {rankedTeams.length === 0 && (
                  <div className="px-6 py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(230, 206, 242, 0.5)' }}>
                      <Trophy size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No teams registered yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <div className="mt-6 md:mt-8 glass-card rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
                <div className="px-4 md:px-6 py-3 md:py-5 flex items-center gap-2 md:gap-3" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl" style={{ background: 'rgba(255, 143, 171, 0.2)' }}>
                    <TrendingUp size={14} className="md:hidden text-[var(--art-accent)]" />
                    <TrendingUp size={18} className="hidden md:block text-[var(--art-accent)]" />
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-foreground">Recent Results</h3>
                  <span className="ml-auto text-[10px] md:text-xs text-muted-foreground">Live</span>
                </div>
                <div className="divide-y max-h-60 md:max-h-72 overflow-y-auto" style={{ borderColor: 'rgba(0, 0, 0, 0.03)' }}>
                  {recentResults.map((result, index) => (
                    <div 
                      key={result.id} 
                      className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-white/60 transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${Math.min(index * 20, 150)}ms` }}
                    >
                      <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <span className="text-lg md:text-2xl flex-shrink-0">
                          {result.position === "1st" ? "🥇" : result.position === "2nd" ? "🥈" : result.position === "3rd" ? "🥉" : "🎖️"}
                        </span>
                        <div 
                          className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl shadow-md flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: result.team?.color || '#ccc',
                            boxShadow: `0 2px 10px ${result.team?.color || '#ccc'}40`
                          }}
                        >
                          <span className="text-white text-[10px] md:text-xs font-black">
                            {result.team?.short_name || 'T'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs md:text-sm text-foreground truncate">{result.team?.name || "Team"}</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground truncate">{result.event?.title || "Event"}</div>
                        </div>
                      </div>
                      <span className="font-black text-sm md:text-lg gradient-text flex-shrink-0 ml-2">+{result.points}</span>
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
