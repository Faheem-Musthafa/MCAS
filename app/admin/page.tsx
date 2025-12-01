"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutDashboard, Calendar, Trophy, ImageIcon, Gavel, ArrowLeft, Menu, X, ClipboardCheck } from "lucide-react"
import { EventsManager } from "@/components/admin/events-manager"
import { ScoresManager } from "@/components/admin/scores-manager"
import { JudgesManager } from "@/components/admin/judges-manager"
import { GalleryManager } from "@/components/admin/gallery-manager"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { ApprovalManager } from "@/components/admin/approval-manager"

type Tab = "overview" | "events" | "scores" | "approvals" | "judges" | "gallery"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "events" as Tab, label: "Events", icon: Calendar },
    { id: "scores" as Tab, label: "Scoreboard", icon: Trophy },
    { id: "approvals" as Tab, label: "Approvals", icon: ClipboardCheck },
    { id: "judges" as Tab, label: "Judges", icon: Gavel },
    { id: "gallery" as Tab, label: "Gallery", icon: ImageIcon },
  ]

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

          {/* Back to Site */}
          <div className="p-4 border-t border-border">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Website
            </Link>
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

        {/* Content - Added ApprovalManager render */}
        <div className="p-6">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "events" && <EventsManager />}
          {activeTab === "scores" && <ScoresManager />}
          {activeTab === "approvals" && <ApprovalManager />}
          {activeTab === "judges" && <JudgesManager />}
          {activeTab === "gallery" && <GalleryManager />}
        </div>
      </main>
    </div>
  )
}
