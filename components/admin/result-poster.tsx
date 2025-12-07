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

// Updated color scheme based on the reference poster
const POSITION_COLORS: Record<ResultPosition, { bg: string; text: string; glow: string; emoji: string }> = {
  "1st": { bg: "#FBBF24", text: "#78350F", glow: "rgba(251, 191, 36, 0.6)", emoji: "🥇" }, // Gold
  "2nd": { bg: "#94A3B8", text: "#0F172A", glow: "rgba(148, 163, 184, 0.6)", emoji: "🥈" }, // Silver/Blue
  "3rd": { bg: "#B45309", text: "#FFFBEB", glow: "rgba(180, 83, 9, 0.6)", emoji: "🥉" },   // Bronze
  "participation": { bg: "#334155", text: "#F8FAFC", glow: "rgba(51, 65, 85, 0.6)", emoji: "🎖️" }, // Slate
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

    // Poster dimensions (Square)
    const width = 1080
    const height = 1080
    canvas.width = width
    canvas.height = height

    // Load background image
    const bgImage = new window.Image()
    bgImage.src = event.category === "ART" ? "/POSTER_TEMP_ARTS.png" : "/POSTER_TEMP_SPORTS.png"
    bgImage.crossOrigin = "anonymous"
    
    // Load medal images
    const medalImages: Record<string, HTMLImageElement> = {}
    const positions = ["1st", "2nd", "3rd"]
    
    await Promise.all([
      new Promise((resolve) => {
        bgImage.onload = resolve
        bgImage.onerror = () => {
          console.error("Failed to load background image")
          resolve(null)
        }
      }),
      ...positions.map(pos => new Promise((resolve) => {
        const img = new window.Image()
        // Map 1st -> 1.png, 2nd -> 2.png, 3rd -> 3.png
        const imgName = pos.replace("st", "").replace("nd", "").replace("rd", "")
        img.src = `/${imgName}.png`
        img.crossOrigin = "anonymous"
        img.onload = () => {
          medalImages[pos] = img
          resolve(null)
        }
        img.onerror = () => {
          console.error(`Failed to load medal ${pos}`)
          resolve(null)
        }
      }))
    ])

    // Draw background if loaded
    if (bgImage.complete && bgImage.naturalWidth !== 0) {
      ctx.drawImage(bgImage, 0, 0, width, height)
    } else {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, "#0f172a")
        gradient.addColorStop(1, "#1e1b4b")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
    }

    // Event Title Area - Script/Handwritten Style
    const titleY = 240
    ctx.save()
    // Title with gradient color (coral/orange)
    ctx.fillStyle = "#F5573B"
    ctx.font = "italic 900 72px 'Georgia', 'Times New Roman', serif"
    ctx.textAlign = "center"
    const eventTitle = event.title
    wrapText(ctx, eventTitle, width / 2, titleY, width - 150, 80)
    ctx.restore()
    
    // "Results" subtitle
    ctx.save()
    ctx.fillStyle = "#64748b"
    ctx.font = "500 28px 'Inter', system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Results", width / 2, titleY + 90)
    ctx.restore()

    // Results Section
    let yPos = 420
    const sortedResults = [...results].sort((a, b) => {
      const order = { "1st": 0, "2nd": 1, "3rd": 2, "participation": 3 }
      return order[a.position] - order[b.position]
    })

    for (const result of sortedResults) {
      const cardHeight = 120
      const cardWidth = width - 200
      const xPos = 100
      
      // Card Background - Clean white with subtle shadow
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.08)"
      ctx.shadowBlur = 25
      ctx.shadowOffsetY = 8
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.98)"
      roundRect(ctx, xPos, yPos, cardWidth, cardHeight, 20)
      ctx.fill()
      ctx.restore()

      // Position Medal/Badge (Left Side)
      const badgeSize = 80
      const badgeX = xPos + 25
      const badgeY = yPos + (cardHeight - badgeSize) / 2
      
      if (medalImages[result.position]) {
        // Draw Image Medal
        ctx.save()
        ctx.shadowColor = "rgba(0,0,0,0.2)"
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 4
        ctx.drawImage(medalImages[result.position], badgeX, badgeY, badgeSize, badgeSize)
        ctx.restore()
      } else {
        // Draw Fallback Circle for Participation
        ctx.save()
        const medalColors = POSITION_COLORS[result.position] || POSITION_COLORS["participation"]
        
        ctx.shadowColor = medalColors.glow
        ctx.shadowBlur = 12
        ctx.fillStyle = medalColors.bg
        ctx.beginPath()
        ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2 - 5, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = medalColors.text
        ctx.font = "700 28px 'Inter', system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("P", badgeX + badgeSize/2, badgeY + badgeSize/2)
        ctx.restore()
      }

      // Content Area
      const contentX = badgeX + badgeSize + 30
      const contentCenterY = yPos + cardHeight / 2
      
      // Participant Name - Colored for 1st place, dark for others
      ctx.textAlign = "left"
      ctx.textBaseline = "alphabetic"
      
      if (result.position === "1st") {
        ctx.fillStyle = "#F5573B" // Coral/Orange for winner
      } else {
        ctx.fillStyle = "#1e293b" // Dark for others
      }
      ctx.font = "700 36px 'Inter', system-ui, -apple-system, sans-serif"
      const displayName = result.participant_name || "Team Entry"
      ctx.fillText(truncateText(ctx, displayName, 450), contentX, contentCenterY - 8)
      
      // Team/Department Info - Gray subtitle
      ctx.fillStyle = "#94a3b8"
      ctx.font = "400 22px 'Inter', system-ui, -apple-system, sans-serif"
      ctx.fillText(result.team.name, contentX, contentCenterY + 22)

      // Points (Right Side) - Simple +X format
      const pointsX = xPos + cardWidth - 50
      
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#64748b"
      ctx.font = "600 36px 'Inter', system-ui, sans-serif"
      ctx.fillText(`+${result.points}`, pointsX, contentCenterY)

      yPos += cardHeight + 20
    }



    // Convert to image
    const dataUrl = canvas.toDataURL("image/png")
    setImageUrl(dataUrl)
    setGenerating(false)
  }



  const savePosterToGallery = async () => {
    if (!imageUrl || saved) return
    
    setSaving(true)
    try {
      // Save to posters table (will update if exists for this event)
      const res = await fetch("/api/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          src: imageUrl,
          title: `${event.title} - Result`,
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
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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