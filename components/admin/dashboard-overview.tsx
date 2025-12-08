"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Calendar, Trophy, Users, ImageIcon, Loader2, Clock, 
  TrendingUp, Award, Flame, CheckCircle2, PlayCircle, RefreshCw
} from "lucide-react"
import type { DbEvent, DbTeam, DbResultWithTeam } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

interface Stats {
  totalEvents: number
  completedEvents: number
  ongoingEvents: number
  upcomingEvents: number
  totalTeams: number
  totalResults: number
  totalGallery: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    completedEvents: 0,
    ongoingEvents: 0,
    upcomingEvents: 0,
    totalTeams: 0,
    totalResults: 0,
    totalGallery: 0,
  })
  const [events, setEvents] = useState<DbEvent[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [recentResults, setRecentResults] = useState<DbResultWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      
      const [eventsRes, teamsRes, galleryRes, resultsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/teams"),
        fetch("/api/gallery"),
        fetch("/api/results"),
      ])

      const eventsData = eventsRes.ok ? await eventsRes.json() : []
      const teamsData = teamsRes.ok ? await teamsRes.json() : []
      const galleryData = galleryRes.ok ? await galleryRes.json() : []
      const resultsData = resultsRes.ok ? await resultsRes.json() : []

      setEvents(eventsData)
      setTeams(teamsData)
      setRecentResults(resultsData.slice(0, 5))
      setLastUpdated(new Date())

      setStats({
        totalEvents: eventsData.length,
        completedEvents: eventsData.filter((e: DbEvent) => e.status === "completed").length,
        ongoingEvents: eventsData.filter((e: DbEvent) => e.status === "ongoing").length,
        upcomingEvents: eventsData.filter((e: DbEvent) => e.status === "upcoming").length,
        totalTeams: teamsData.length,
        totalResults: resultsData.length,
        totalGallery: galleryData.length,
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh for real-time updates
    const interval = setInterval(() => fetchData(true), FEST_CONFIG.refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData])

  // Get top 3 teams
  const topTeams = [...teams].sort((a, b) => b.total_points - a.total_points).slice(0, 3)

  // Get today's events (or next day's if none today)
  const todayEvents = events.filter(e => e.status === "ongoing" || e.status === "upcoming").slice(0, 4)

  // Calculate fest progress
  const festProgress = stats.totalEvents > 0 
    ? Math.round((stats.completedEvents / stats.totalEvents) * 100) 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Fest Header */}
      <div className="p-6 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent rounded-2xl border border-accent/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{FEST_CONFIG.name} Admin Panel</h1>
            <p className="text-muted-foreground">{FEST_CONFIG.fullName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {FEST_CONFIG.department} • {FEST_CONFIG.studentUnion}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button> */}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar size={20} />
            </div>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <TrendingUp size={12} />
              {stats.ongoingEvents} live
            </span>
          </div>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.totalTeams}</div>
          <div className="text-sm text-muted-foreground">Competing Teams</div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.totalResults}</div>
          <div className="text-sm text-muted-foreground">Results Declared</div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
              <ImageIcon size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.totalGallery}</div>
          <div className="text-sm text-muted-foreground">Gallery Items</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            <h2 className="font-semibold">Leaderboard</h2>
          </div>
          <div className="divide-y divide-border">
            {topTeams.map((team, index) => (
              <div key={team.id} className="p-4 flex items-center gap-3">
                <span className={`text-2xl font-bold w-8 ${
                  index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-500"
                }`}>
                  {index + 1}
                </span>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: team.color + "20", color: team.color }}
                >
                  {team.short_name}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{team.name}</div>
                  <div className="text-xs text-muted-foreground">{team.department}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">{team.total_points}</div>
                  <div className="text-xs text-muted-foreground">pts</div>
                </div>
              </div>
            ))}
            {topTeams.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No teams registered yet
              </div>
            )}
          </div>
        </div>

        {/* Today's Events */}
      </div>

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Flame size={18} className="text-accent" />
            <h2 className="font-semibold">Recent Results</h2>
          </div>
          <div className="divide-y divide-border">
            {recentResults.map((result) => (
              <div key={result.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {result.position === "1st" ? "🥇" : result.position === "2nd" ? "🥈" : result.position === "3rd" ? "🥉" : "🎖️"}
                  </span>
                  <div>
                    <div className="font-medium">{result.team?.name || "Team"}</div>
                    <div className="text-sm text-muted-foreground">{result.event?.title || "Event"}</div>
                  </div>
                </div>
                <span className="font-bold text-accent">+{result.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
