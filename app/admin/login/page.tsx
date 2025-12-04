"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, User, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push("/admin")
      } else {
        const data = await res.json()
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-radial-pastel">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-pink absolute top-20 -left-20 w-[300px] h-[300px] opacity-40" style={{ animationDelay: '0s' }} />
        <div className="blob blob-blue absolute bottom-20 -right-20 w-[350px] h-[350px] opacity-40" style={{ animationDelay: '2s' }} />
        <div className="blob blob-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] opacity-30" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 glass-card rounded-3xl mb-4">
            <ShieldCheck className="w-10 h-10 text-[var(--art-accent)]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={20} className="text-[var(--art-accent)]" />
            <span className="text-xl font-bold gradient-text">Artistry 2025</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--art-text)]">Admin Login</h1>
          <p className="text-[var(--art-text-light)] mt-2">Control Panel Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-card rounded-3xl p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl text-sm text-center" style={{ background: 'rgba(255, 107, 107, 0.2)', border: '1px solid rgba(255, 107, 107, 0.4)', color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--art-text-light)]">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--art-text-light)]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border text-[var(--art-text)] placeholder:text-[var(--art-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--art-accent)] transition-all"
                style={{ background: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--art-text-light)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--art-text-light)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-11 pr-12 py-3 rounded-xl border text-[var(--art-text)] placeholder:text-[var(--art-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--art-accent)] transition-all"
                style={{ background: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(0, 0, 0, 0.1)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--art-text-light)] hover:text-[var(--art-text)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 btn-pastel-pink font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[var(--art-text-light)] text-sm mt-6">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  )
}
