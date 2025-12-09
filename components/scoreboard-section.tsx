"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2, Crown, Flame, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { DbTeam, DbResultWithTeam } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

export function ScoreboardSection() {
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [artResults, setArtResults] = useState<DbResultWithTeam[]>([])
  const [sportsResults, setSportsResults] = useState<DbResultWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'ART' | 'SPORTS'>('ART')

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
        }
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          // Separate results by category
          const artResultsData = resultsData.filter((r: DbResultWithTeam) => r.event?.category === 'ART').slice(0, 8)
          const sportsResultsData = resultsData.filter((r: DbResultWithTeam) => r.event?.category === 'SPORTS').slice(0, 8)
          setArtResults(artResultsData)
          setSportsResults(sportsResultsData)
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
          const artResultsData = resultsData.filter((r: DbResultWithTeam) => r.event?.category === 'ART').slice(0, 8)
          const sportsResultsData = resultsData.filter((r: DbResultWithTeam) => r.event?.category === 'SPORTS').slice(0, 8)
          setArtResults(artResultsData)
          setSportsResults(sportsResultsData)
        }
      } catch (error) {
        console.error("Failed to fetch updates:", error)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <section id="scoreboard" className="relative overflow-hidden bg-gradient-to-b from-transparent via-muted/30 to-transparent">"`
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
    <section id="scoreboard" className="relative overflow-hidden bg-gradient-to-b from-transparent via-muted/30 to-transparent">`
      <div className="container mx-auto px-4 relative py-20 md:py-32">"`
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="p-3 md:p-4 rounded-2xl glass-card">
              <Trophy size={28} className="text-[var(--art-accent)] md:w-8 md:h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-[var(--art-purple)] to-[var(--art-pink)] bg-clip-text text-transparent">
                Live Scoreboard
              </h2>
              <div 
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full transition-all duration-300 shadow-lg`}
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 143, 171, 0.3), rgba(255, 143, 171, 0.1))',
                  border: '1px solid rgba(255, 143, 171, 0.2)' 
                }}
              >
                <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg`} style={{ background: 'var(--art-accent)', boxShadow: '0 0 10px var(--art-accent)' }} />
                <span className="text-xs md:text-sm font-bold text-[var(--art-accent)]">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="glass-card p-2 rounded-2xl">
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedCategory('ART')}
                className={`px-6 md:px-8 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                  selectedCategory === 'ART'
                    ? 'bg-gradient-to-r from-[var(--art-purple)] to-[var(--art-pink)] text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                🎨 Arts Leaderboard
              </button>
              <button
                onClick={() => setSelectedCategory('SPORTS')}
                className={`px-6 md:px-8 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                  selectedCategory === 'SPORTS'
                    ? 'bg-gradient-to-r from-[var(--art-blue)] to-[var(--art-green)] text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                🏆 Sports Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Current Category Results */}
        <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
          {/* Category Header */}
          <div className={`px-4 md:px-6 py-4 md:py-5 text-center ${
            selectedCategory === 'ART' 
              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200/50'
              : 'bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-200/50'
          }`}>
            <h3 className="font-bold text-lg md:text-xl">
              {selectedCategory === 'ART' ? '🎨 Arts Events' : '🏆 Sports Events'} - Team Rankings
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Based on {selectedCategory === 'ART' ? 'creative performance' : 'athletic achievement'} points
            </p>
          </div>

          {/* Leaderboard Content */}
          <div className="p-4 md:p-6">
            <div className="relative">
              {/* Calculate teams ranking for selected category */}
              {(() => {
                const currentResults = selectedCategory === 'ART' ? artResults : sportsResults
                const teamsWithCategoryPoints = teams.map(team => {
                  const teamResults = currentResults.filter(r => r.team_id === team.id)
                  const categoryPoints = teamResults.reduce((sum, r) => sum + (r.points || 0), 0)
                  const categoryWins = teamResults.filter(r => r.position === '1st').length
                  const categorySilver = teamResults.filter(r => r.position === '2nd').length
                  const categoryBronze = teamResults.filter(r => r.position === '3rd').length
                  
                  return {
                    ...team,
                    categoryPoints,
                    categoryWins,
                    categorySilver,
                    categoryBronze
                  }
                }).sort((a, b) => b.categoryPoints - a.categoryPoints)

                return (
                  <div className="space-y-3 md:space-y-4">
                    {teamsWithCategoryPoints.length === 0 ? (
                      <div className="text-center py-12">
                        <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No teams registered yet</p>
                      </div>
                    ) : (
                      teamsWithCategoryPoints.map((team, index) => {
                        const isFirst = index === 0
                        const isSecond = index === 1
                        const isThird = index === 2
                        
                        return (
                          <div 
                            key={team.id}
                            className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                              isFirst ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' :
                              isSecond ? 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 shadow-md' :
                              isThird ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md' :
                              'bg-white/50 border-white/30 hover:bg-white/70'
                            }`}
                          >
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 text-center">
                              {isFirst ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-2xl md:text-3xl">🥇</span>
                                  <Crown size={16} className="text-yellow-600 mt-1" />
                                </div>
                              ) : isSecond ? (
                                <span className="text-2xl md:text-3xl">🥈</span>
                              ) : isThird ? (
                                <span className="text-2xl md:text-3xl">🥉</span>
                              ) : (
                                <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                              )}
                            </div>
                            
                            {/* Team Color & Letter */}
                            <div 
                              className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
                              style={{ 
                                backgroundColor: team.color,
                                boxShadow: `0 4px 15px ${team.color}40`
                              }}
                            >
                              <span className="text-white font-black text-lg md:text-xl tracking-wide drop-shadow-md">
                                {team.short_name}
                              </span>
                            </div>
                            
                            {/* Team Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base md:text-lg text-foreground truncate">
                                  {team.name}
                                </h3>
                                {isFirst && <Flame size={16} className="text-orange-500 animate-pulse" />}
                                {isSecond && <Sparkles size={14} className="text-gray-400" />}
                              </div>
                              <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  🥇 {team.categoryWins}
                                </span>
                                <span className="flex items-center gap-1">
                                  🥈 {team.categorySilver}
                                </span>
                                <span className="flex items-center gap-1">
                                  🥉 {team.categoryBronze}
                                </span>
                              </div>
                            </div>
                            
                            {/* Category Points */}
                            <div className="flex-shrink-0 text-right">
                              <div className={`text-2xl md:text-3xl font-black ${
                                selectedCategory === 'ART' 
                                  ? 'text-purple-600' 
                                  : 'text-blue-600'
                              }`}>
                                {team.categoryPoints}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedCategory === 'ART' ? 'Arts' : 'Sports'} pts
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Recent Results for Selected Category */}
        <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden shadow-xl mt-6 md:mt-8">
          <div className={`px-4 md:px-6 py-4 md:py-5 ${
            selectedCategory === 'ART'
              ? 'bg-gradient-to-r from-purple-50 to-pink-50'
              : 'bg-gradient-to-r from-blue-50 to-green-50'
          }`}>
            <h3 className="font-bold text-lg md:text-xl text-center">
              Recent {selectedCategory === 'ART' ? 'Arts' : 'Sports'} Results
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center mt-1">
              Latest competition outcomes
            </p>
          </div>
          
          <div className="p-4 md:p-6">
            {(selectedCategory === 'ART' ? artResults : sportsResults).length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="mb-4 text-4xl md:text-6xl">
                  {selectedCategory === 'ART' ? '🎨' : '🏆'}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">No {selectedCategory === 'ART' ? 'Arts' : 'Sports'} Results Yet</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Results will appear here as {selectedCategory === 'ART' ? 'creative competitions' : 'athletic events'} are completed.
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {(selectedCategory === 'ART' ? artResults : sportsResults).slice(0, 6).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/30 border border-white/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs md:text-sm font-bold px-2 py-1 rounded-lg bg-white/50">
                          {result.event?.title || 'Event'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.event?.event_type === 'group' ? 'Group Event' : 'Individual Event'}
                        </span>
                      </div>
                      <div className="text-sm md:text-base font-semibold">
                        {teams.find(t => t.id === result.team_id)?.name} - Position {result.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg md:text-xl font-bold ${
                        selectedCategory === 'ART' 
                          ? 'text-purple-600' 
                          : 'text-blue-600'
                      }`}>
                        +{result.points} pts
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}