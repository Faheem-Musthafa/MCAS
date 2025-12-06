"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Calendar, ImageIcon, ArrowLeft, Menu, X, Users, Award, Loader2, LogOut } from "lucide-react"
import { EventsManager } from "@/components/admin/events-manager"
import { GalleryManager } from "@/components/admin/gallery-manager"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { TeamsManager } from "@/components/admin/teams-manager"
import { ResultsManager } from "@/components/admin/results-manager"

type Tab = "overview" | "events" | "teams" | "results" | "gallery"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/check")
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const tabs = [
    { id: "overview" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "events" as Tab, label: "Events", icon: Calendar },
    { id: "teams" as Tab, label: "Teams", icon: Users },
    { id: "results" as Tab, label: "Results", icon: Award },
    { id: "gallery" as Tab, label: "Gallery", icon: ImageIcon },
  ]

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">MCAS</span>
              <span className="text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Back to Site & Logout */}
          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            >
              <ArrowLeft size={18} />
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "events" && <EventsManager />}
          {activeTab === "teams" && <TeamsManager />}
          {activeTab === "results" && <ResultsManager />}
          {activeTab === "gallery" && <GalleryManager />}
        </div>
      </main>
    </div>
  )
}
