"use client"

import { useRef, useEffect, useState } from "react"
import { Download, Share2, X, Check, Loader2 } from "lucide-react"
import Lottie from "lottie-react"
import type { DbEvent, DbTeam, ResultPosition } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

// Lottie animation data for confetti/celebration
const confettiAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Confetti",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Star 1",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100], h: 0 }, { t: 60, s: [0], h: 0 }] },
        r: { a: 1, k: [{ t: 0, s: [0], h: 0 }, { t: 60, s: [360], h: 0 }] },
        p: { a: 1, k: [{ t: 0, s: [100, 50, 0], h: 0 }, { t: 60, s: [100, 180, 0], h: 0 }] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{
        ty: "sr",
        sy: 1,
        d: 1,
        pt: { a: 0, k: 5 },
        p: { a: 0, k: [0, 0] },
        r: { a: 0, k: 0 },
        ir: { a: 0, k: 5 },
        is: { a: 0, k: 0 },
        or: { a: 0, k: 12 },
        os: { a: 0, k: 0 },
        nm: "Star",
        hd: false
      }, {
        ty: "fl",
        c: { a: 0, k: [1, 0.84, 0, 1] },
        o: { a: 0, k: 100 },
        r: 1,
        nm: "Fill",
        hd: false
      }]
    }
  ]
}

// Trophy animation
const trophyAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 100,
  h: 100,
  nm: "Trophy",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Trophy",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [-5], h: 0 }, { t: 45, s: [5], h: 0 }, { t: 90, s: [-5], h: 0 }] },
        p: { a: 1, k: [{ t: 0, s: [50, 52, 0], h: 0 }, { t: 45, s: [50, 48, 0], h: 0 }, { t: 90, s: [50, 52, 0], h: 0 }] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{
        ty: "gr",
        it: [{
          ty: "rc",
          d: 1,
          s: { a: 0, k: [40, 50] },
          p: { a: 0, k: [0, -10] },
          r: { a: 0, k: 8 },
          nm: "Cup",
          hd: false
        }, {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [20, 15] },
          p: { a: 0, k: [0, 22] },
          r: { a: 0, k: 3 },
          nm: "Base",
          hd: false
        }, {
          ty: "fl",
          c: { a: 0, k: [1, 0.84, 0, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill",
          hd: false
        }],
        nm: "Trophy Group",
        hd: false
      }]
    }
  ]
}

interface ResultData {
  position: ResultPosition
  participant_name: string
  team: DbTeam
  points: number
}

export interface PosterData {
  event: DbEvent
  results: ResultData[]
}

interface ResultPosterProps {
  data: PosterData
  onClose: () => void
  onSaved?: () => void
}

const POSITION_COLORS: Record<ResultPosition, { bg: string; text: string; glow: string; emoji: string }> = {
  "1st": { bg: "#FFD700", text: "#000", glow: "rgba(255, 215, 0, 0.6)", emoji: "🥇" },
  "2nd": { bg: "#C0C0C0", text: "#000", glow: "rgba(192, 192, 192, 0.6)", emoji: "🥈" },
  "3rd": { bg: "#CD7F32", text: "#fff", glow: "rgba(205, 127, 50, 0.6)", emoji: "🥉" },
  "participation": { bg: "#6366f1", text: "#fff", glow: "rgba(99, 102, 241, 0.6)", emoji: "🎖️" },
}

export function ResultPoster({ data, onClose, onSaved }: ResultPosterProps) {
  const { event, results } = data
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [generating, setGenerating] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    generatePoster()
  }, [event, results])

  const generatePoster = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Poster dimensions (Instagram story size)
    const width = 1080
    const height = 1920
    canvas.width = width
    canvas.height = height

    // Background gradient - Deep rich dark theme
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#0f172a")     // Slate 900
    gradient.addColorStop(0.4, "#1e1b4b")   // Indigo 950
    gradient.addColorStop(0.8, "#312e81")   // Indigo 900
    gradient.addColorStop(1, "#0f172a")     // Slate 900
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add noise texture for premium feel
    drawNoise(ctx, width, height)

    // Decorative elements
    drawDecorativeElements(ctx, width, height)

    // Header - Fest Name with 3D text effect
    ctx.save()
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
    ctx.fillStyle = "#ffffff"
    ctx.font = "900 64px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(FEST_CONFIG.name, width / 2, 140)
    
    // Subheader with tracking
    ctx.shadowColor = "transparent"
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.fillStyle = "#94a3b8"
    ctx.font = "500 28px system-ui, -apple-system, sans-serif"
    ctx.letterSpacing = "4px"
    ctx.fillText(FEST_CONFIG.college.toUpperCase(), width / 2, 190)
    ctx.restore()

    // "RESULT ANNOUNCED" Banner - Modern Glass Style
    const bannerY = 280
    
    // Glow behind banner
    const bannerGlow = ctx.createRadialGradient(width/2, bannerY, 0, width/2, bannerY, 400)
    bannerGlow.addColorStop(0, "rgba(139, 92, 246, 0.3)")
    bannerGlow.addColorStop(1, "transparent")
    ctx.fillStyle = bannerGlow
    ctx.fillRect(0, bannerY - 100, width, 200)

    // Banner background
    ctx.save()
    ctx.shadowColor = "rgba(139, 92, 246, 0.4)"
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 10
    
    const bannerGradient = ctx.createLinearGradient(100, bannerY - 40, width - 100, bannerY + 40)
    bannerGradient.addColorStop(0, "#4c1d95")
    bannerGradient.addColorStop(0.5, "#6d28d9")
    bannerGradient.addColorStop(1, "#4c1d95")
    
    ctx.fillStyle = bannerGradient
    roundRect(ctx, 180, bannerY - 45, width - 360, 90, 45)
    ctx.fill()
    
    // Inner shine
    const shineGrad = ctx.createLinearGradient(0, bannerY - 45, 0, bannerY)
    shineGrad.addColorStop(0, "rgba(255,255,255,0.2)")
    shineGrad.addColorStop(1, "transparent")
    ctx.fillStyle = shineGrad
    roundRect(ctx, 180, bannerY - 45, width - 360, 45, 45)
    ctx.fill()
    ctx.restore()
    
    // Banner Text
    ctx.fillStyle = "#fff"
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("✨ RESULT ANNOUNCED ✨", width / 2, bannerY + 12)

    // Event Title Area
    const titleY = 460
    ctx.save()
    // Title Glow
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
    ctx.shadowBlur = 30
    ctx.fillStyle = "#fff"
    ctx.font = "900 84px system-ui, -apple-system, sans-serif"
    const eventTitle = event.title.toUpperCase()
    wrapText(ctx, eventTitle, width / 2, titleY, width - 100, 90)
    ctx.restore()

    // Event Details Pill
    const detailsY = 580
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    roundRect(ctx, (width - 600) / 2, detailsY - 30, 600, 60, 30)
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = "#cbd5e1"
    ctx.font = "600 28px system-ui, -apple-system, sans-serif"
    const categoryIcon = event.category === "ART" ? "🎨" : "⚽"
    const stageIcon = event.stage_type === "on-stage" ? "🎤" : "📝"
    ctx.fillText(`${categoryIcon} ${event.category}   |   ${stageIcon} ${event.stage_type.toUpperCase()}   |   Day ${event.day}`, width / 2, detailsY + 10)

    // Results Section
    let yPos = 720
    const sortedResults = [...results].sort((a, b) => {
      const order = { "1st": 0, "2nd": 1, "3rd": 2, "participation": 3 }
      return order[a.position] - order[b.position]
    })

    for (const result of sortedResults) {
      const colors = POSITION_COLORS[result.position]
      const isWinner = result.position === "1st"
      const cardHeight = isWinner ? 260 : 220
      const cardWidth = width - 140
      const xPos = 70
      
      // Card Background with Glassmorphism
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.3)"
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 10
      
      // Gradient based on position
      const cardGrad = ctx.createLinearGradient(xPos, yPos, xPos + cardWidth, yPos + cardHeight)
      if (isWinner) {
        cardGrad.addColorStop(0, "rgba(255, 215, 0, 0.15)")
        cardGrad.addColorStop(1, "rgba(255, 215, 0, 0.05)")
      } else {
        cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.1)")
        cardGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)")
      }
      
      ctx.fillStyle = cardGrad
      roundRect(ctx, xPos, yPos, cardWidth, cardHeight, 30)
      ctx.fill()
      ctx.restore()

      // Border
      ctx.strokeStyle = isWinner ? "rgba(255, 215, 0, 0.3)" : "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = isWinner ? 3 : 1
      roundRect(ctx, xPos, yPos, cardWidth, cardHeight, 30)
      ctx.stroke()

      // Position Badge (Left Side)
      const badgeSize = isWinner ? 140 : 110
      const badgeX = xPos + 40
      const badgeY = yPos + (cardHeight - badgeSize) / 2
      
      drawMedal(ctx, badgeX, badgeY, badgeSize, result.position)

      // Content Area
      const contentX = badgeX + badgeSize + 40
      const contentCenterY = yPos + cardHeight / 2
      
      // Participant Name
      ctx.textAlign = "left"
      ctx.fillStyle = "#fff"
      ctx.font = isWinner ? "bold 52px system-ui, -apple-system, sans-serif" : "bold 44px system-ui, -apple-system, sans-serif"
      const displayName = result.participant_name || "Team Entry"
      ctx.fillText(truncateText(ctx, displayName, 550), contentX, contentCenterY - 15)
      
      // Team Info
      const teamY = contentCenterY + 35
      
      // Team Color Pill
      ctx.fillStyle = result.team.color + "20" // 20% opacity
      roundRect(ctx, contentX, teamY - 20, 200, 40, 20)
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(contentX + 20, teamY, 8, 0, Math.PI * 2)
      ctx.fillStyle = result.team.color
      ctx.fill()
      
      ctx.fillStyle = result.team.color
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif"
      ctx.fillText(result.team.name.toUpperCase(), contentX + 40, teamY + 8)

      // Points (Right Side)
      const pointsX = xPos + cardWidth - 50
      
      ctx.textAlign = "right"
      ctx.fillStyle = isWinner ? "#fbbf24" : "#e2e8f0"
      ctx.font = "900 56px system-ui, -apple-system, sans-serif"
      ctx.fillText(`+${result.points}`, pointsX, contentCenterY + 10)
      
      ctx.fillStyle = "#64748b"
      ctx.font = "500 20px system-ui, -apple-system, sans-serif"
      ctx.fillText("POINTS", pointsX, contentCenterY + 40)

      yPos += cardHeight + 30
    }

    // Footer section
    const footerY = height - 180
    
    // Stylish Divider
    const dividerGrad = ctx.createLinearGradient(width/2 - 200, footerY, width/2 + 200, footerY)
    dividerGrad.addColorStop(0, "transparent")
    dividerGrad.addColorStop(0.5, "rgba(255,255,255,0.3)")
    dividerGrad.addColorStop(1, "transparent")
    ctx.fillStyle = dividerGrad
    ctx.fillRect(width/2 - 200, footerY, 400, 2)

    // Footer Logo/Text
    ctx.textAlign = "center"
    ctx.fillStyle = "#fff"
    ctx.font = "bold 32px system-ui, -apple-system, sans-serif"
    ctx.fillText("MCAS FEST 2025", width / 2, footerY + 60)
    
    ctx.fillStyle = "#64748b"
    ctx.font = "24px system-ui, -apple-system, sans-serif"
    ctx.fillText("Celebrating Excellence", width / 2, footerY + 100)

    // Convert to image
    const dataUrl = canvas.toDataURL("image/png")
    setImageUrl(dataUrl)
    setGenerating(false)
  }

  const drawNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 10 - 5
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise))
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const drawMedal = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, position: ResultPosition) => {
    const colors = POSITION_COLORS[position]
    const radius = size / 2
    const centerX = x + radius
    const centerY = y + radius

    ctx.save()
    
    // Outer Ring/Glow
    ctx.shadowColor = colors.glow
    ctx.shadowBlur = 20
    ctx.fillStyle = colors.bg
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Inner Circle (Darker)
    ctx.shadowBlur = 0
    const innerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    innerGrad.addColorStop(0, "#fff")
    innerGrad.addColorStop(0.3, colors.bg)
    innerGrad.addColorStop(1, "#000") // Dark edge
    
    ctx.fillStyle = innerGrad
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2)
    ctx.fill()

    // Center Circle (Lighter)
    ctx.fillStyle = colors.bg
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2)
    ctx.fill()

    // Text/Emoji
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    if (position === "participation") {
      ctx.font = `${size * 0.5}px system-ui`
      ctx.fillText("🎖️", centerX, centerY)
    } else {
      // Rank Number
      ctx.fillStyle = "#000"
      ctx.font = `bold ${size * 0.5}px system-ui`
      ctx.fillText(position.replace(/\D/g, ''), centerX, centerY - size * 0.1)
      
      // Rank Suffix (st, nd, rd)
      ctx.font = `bold ${size * 0.2}px system-ui`
      ctx.fillText(position.replace(/\d/g, '').toUpperCase(), centerX, centerY + size * 0.25)
    }

    ctx.restore()
  }

  const drawDecorativeElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dynamic curves
    ctx.save()
    ctx.globalAlpha = 0.1
    
    // Top curve
    const grad1 = ctx.createLinearGradient(0, 0, width, 400)
    grad1.addColorStop(0, "#4f46e5")
    grad1.addColorStop(1, "transparent")
    ctx.fillStyle = grad1
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(width, 0)
    ctx.lineTo(width, 200)
    ctx.bezierCurveTo(width/2, 400, width/4, 100, 0, 300)
    ctx.fill()

    // Bottom curve
    const grad2 = ctx.createLinearGradient(0, height-400, width, height)
    grad2.addColorStop(0, "transparent")
    grad2.addColorStop(1, "#ec4899")
    ctx.fillStyle = grad2
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(width, height)
    ctx.lineTo(width, height-300)
    ctx.bezierCurveTo(width/2, height-500, width/4, height-100, 0, height-200)
    ctx.fill()
    
    ctx.restore()

    // Floating particles
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const savePosterToGallery = async () => {
    if (!imageUrl || saved) return
    
    setSaving(true)
    try {
      // Check for existing poster
      const checkRes = await fetch(`/api/gallery?type=poster`)
      if (checkRes.ok) {
        const existingPosters = await checkRes.json()
        const existing = existingPosters.find((p: any) => p.event_id === event.id)
        if (existing) {
          // Delete existing poster first
          await fetch(`/api/gallery/${existing.id}`, { method: "DELETE" })
        }
      }

      // Save new poster
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src: imageUrl,
          title: `${event.title} - Result`,
          event_id: event.id,
          day: event.day,
          type: "poster",
          span: "col-span-1 row-span-2",
        }),
      })

      if (res.ok) {
        setSaved(true)
        onSaved?.()
      }
    } catch (error) {
      console.error("Failed to save poster:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    
    const link = document.createElement("a")
    link.download = `${event.title.replace(/\s+/g, "_")}_Result.png`
    link.href = imageUrl
    link.click()
  }

  const handleShare = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `${event.title}_Result.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${event.title} - Result`,
          text: `Check out the results for ${event.title} at ${FEST_CONFIG.name}!`,
          files: [file],
        })
      } else {
        await navigator.clipboard.writeText(`${event.title} Results - ${FEST_CONFIG.name}`)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* Lottie Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 opacity-60">
          <Lottie animationData={confettiAnimation} loop={true} />
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 opacity-60">
          <Lottie animationData={confettiAnimation} loop={true} />
        </div>
        <div className="absolute bottom-20 left-20 w-24 h-24 opacity-40">
          <Lottie animationData={trophyAnimation} loop={true} />
        </div>
        <div className="absolute bottom-20 right-20 w-24 h-24 opacity-40">
          <Lottie animationData={trophyAnimation} loop={true} />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
          <div>
            <h3 className="font-bold text-lg">Result Poster Generated</h3>
            <p className="text-sm text-muted-foreground">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Poster Preview */}
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-background to-secondary/20">
          {generating ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-20 h-20">
                <Lottie animationData={trophyAnimation} loop={true} />
              </div>
              <p className="text-muted-foreground">Generating poster...</p>
            </div>
          ) : (
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img src={imageUrl} alt="Result Poster" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-3 bg-card">
          {/* Save to Gallery Button */}
          <button
            onClick={savePosterToGallery}
            disabled={generating || saving || saved}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              saved 
                ? "bg-green-500/20 text-green-500 cursor-default"
                : "bg-gradient-to-r from-accent to-purple-500 text-white hover:opacity-90"
            } disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : saved ? (
              <Check size={20} />
            ) : (
              <Check size={20} />
            )}
            {saved ? "Published to Results Feed" : "Publish to Results Feed"}
          </button>

          {/* Download & Share */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Download size={20} />
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

// Helper function for rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// Helper function for text wrapping
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ")
  let line = ""
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " "
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + " "
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), x, currentY)
}

// Helper function to truncate text
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const metrics = ctx.measureText(text)
  if (metrics.width <= maxWidth) return text
  
  let truncated = text
  while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + "..."
}
