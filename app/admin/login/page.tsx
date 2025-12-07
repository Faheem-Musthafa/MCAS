"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Lock, User, Eye, EyeOff } from "lucide-react"
import { FEST_CONFIG } from "@/lib/supabase/types"

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0a0015] via-[#030014] to-[#000510]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7928CA]/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0070F3]/15 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#FF0080]/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="relative inline-block mb-6">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#FF0080]/30 via-[#7928CA]/30 to-[#0070F3]/30 blur-2xl rounded-full" />
            
            {/* Gradient border */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] opacity-70" />
            
            {/* Logo container */}
            <div className="relative w-24 h-24 rounded-xl bg-slate-900 overflow-hidden">
              <Image
                src="/ibda.png"
                alt="IBDA Logo"
                fill
                className="object-contain p-3"
                priority
              />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            {FEST_CONFIG.name}
          </h1>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] font-bold text-lg">
            Admin Panel
          </p>
          <p className="text-white/40 text-sm mt-2">Control Panel Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl text-sm text-center bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7928CA] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7928CA] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="group relative w-full py-3 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
          >
            {/* Button gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3]" />
            
            {/* Content */}
            <span className="relative flex items-center gap-2 text-white">
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
            </span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-6">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  )
}
