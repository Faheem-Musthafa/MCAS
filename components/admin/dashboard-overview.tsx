"use client"

import { Calendar, Trophy, ImageIcon, Gavel } from "lucide-react"

const stats = [
  { label: "Total Events", value: "4", change: "+2 this month", icon: Calendar, color: "bg-blue-500/10 text-blue-500" },
  { label: "Active Teams", value: "6", change: "Competing now", icon: Trophy, color: "bg-amber-500/10 text-amber-500" },
  { label: "Expert Judges", value: "5", change: "All active", icon: Gavel, color: "bg-purple-500/10 text-purple-500" },
  { label: "Gallery Items", value: "6", change: "+4 photos", icon: ImageIcon, color: "bg-green-500/10 text-green-500" },
]

const recentActivity = [
  { action: "Score updated", item: "Phoenix Rising - 83 pts", time: "10 min ago" },
  { action: "New judge added", item: "Dr. Priya Sharma", time: "2 hours ago" },
  { action: "Event score finalized", item: "Art Exhibition", time: "5 hours ago" },
  { action: "Team registered", item: "Golden Warriors", time: "1 day ago" },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            <div className="text-xs text-green-500 mt-2">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.item}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Add New Event", desc: "Create a new event entry" },
          { label: "Update Scores", desc: "Modify team scores" },
          { label: "Manage Judges", desc: "Add or edit judges" },
        ].map((action) => (
          <button
            key={action.label}
            className="p-6 bg-card rounded-xl border border-border hover:border-accent/50 transition-colors text-left group"
          >
            <h3 className="font-medium group-hover:text-accent transition-colors">{action.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
