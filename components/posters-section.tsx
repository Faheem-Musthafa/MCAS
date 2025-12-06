"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download, Share2, Loader2, Sparkles } from "lucide-react"
import { FEST_CONFIG, type DbGalleryItem } from "@/lib/supabase/types"
import Lottie from "lottie-react"

// Celebration animation
const celebrationAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  layers: [
    {
      ty: 4,
      nm: "sparkle",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [0] }, { t: 60, s: [100] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [100, 100, 0] },
        s: { a: 1, k: [{ t: 0, s: [50, 50, 100] }, { t: 30, s: [100, 100, 100] }, { t: 60, s: [50, 50, 100] }] }
      },
      shapes: [
        {
          ty: "sr",
          sy: 1,
          d: 1,
          pt: { a: 0, k: 4 },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 0 },
          ir: { a: 0, k: 10 },
          or: { a: 0, k: 30 }
        },
        {
          ty: "fl",
          c: { a: 0, k: [1, 0.84, 0, 1] },
          o: { a: 0, k: 100 }
        }
      ]
    }
  ]
}

export function PostersSection() {
  const [posters, setPosters] = useState<DbGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedPoster, setSelectedPoster] = useState<DbGalleryItem | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const fetchPosters = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery?type=poster")
      if (res.ok) {
        const data = await res.json()
        setPosters(data)
      }
    } catch (error) {
      console.error("Failed to fetch posters:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosters()
    const interval = setInterval(fetchPosters, FEST_CONFIG.refreshInterval)
    return () => clearInterval(interval)
  }, [fetchPosters])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || posters.length <= 1 || selectedPoster) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % posters.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, posters.length, selectedPoster])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + posters.length) % posters.length)
    setIsAutoPlaying(false)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % posters.length)
    setIsAutoPlaying(false)
  }

  const handleDownload = async (poster: DbGalleryItem) => {
    try {
      const response = await fetch(poster.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${poster.title || "poster"}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShare = async (poster: DbGalleryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poster.title || "Event Result",
          text: `Check out this result from ${FEST_CONFIG.name}!`,
          url: poster.src
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error)
        }
      }
    } else {
      navigator.clipboard.writeText(poster.src)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <section className="py-24 bg-transparent flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </section>
    )
  }

  if (posters.length === 0) {
    return null
  }

  const getPosterStyle = (index: number) => {
    const diff = (index - activeIndex + posters.length) % posters.length
    const centerDiff = diff > posters.length / 2 ? diff - posters.length : diff
    
    // Only show 5 items: center, 2 left, 2 right
    if (Math.abs(centerDiff) > 2) return { display: 'none' }

    const isActive = centerDiff === 0
    const xOffset = centerDiff * 60 // Percentage offset
    const scale = isActive ? 1 : 1 - Math.abs(centerDiff) * 0.15
    const opacity = isActive ? 1 : 0.5 - Math.abs(centerDiff) * 0.1
    const zIndex = 10 - Math.abs(centerDiff)
    const rotateY = centerDiff * -15

    return {
      transform: `translateX(${xOffset}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
      filter: isActive ? 'none' : 'blur(2px) brightness(0.5)',
    }
  }

  return (
    <section 
      ref={sectionRef}
      id="results" 
      className="relative py-32 overflow-hidden bg-transparent"
    >
      {/* Floating elements for seamless feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--art-purple)]/20 blur-[128px] animate-float-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--art-pink)]/20 blur-[128px] animate-float-gentle animation-delay-2000" />
      </div>

      {/* Decorative Lottie */}
      <div className="absolute top-20 right-20 w-32 h-32 opacity-40 pointer-events-none">
        <Lottie animationData={celebrationAnimation} loop autoplay />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Latest Achievements</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Results</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Celebrating the champions of {FEST_CONFIG.name}. Witness the glory of victory.
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="relative h-[600px] w-full max-w-6xl mx-auto flex items-center justify-center perspective-1000">
          {posters.map((poster, index) => {
            const style = getPosterStyle(index)
            if (style.display === 'none') return null

            return (
              <div
                key={poster.id}
                className="absolute w-[320px] md:w-[380px] aspect-[9/16] transition-all duration-500 ease-out cursor-pointer"
                style={style as any}
                onClick={() => {
                  if (index === activeIndex) setSelectedPoster(poster)
                  else setActiveIndex(index)
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border bg-card">
                  <Image
                    src={poster.src}
                    alt={poster.title || "Event Result"}
                    fill
                    className="object-cover"
                    priority={index === activeIndex}
                  />
                  
                  {/* Glass Overlay for Active Item */}
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-xl mb-2 line-clamp-2">{poster.title}</h3>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(poster) }}
                            className="flex-1 py-2.5 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                          >
                            <Download size={16} />
                            Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShare(poster) }}
                            className="px-4 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-0 z-30 p-4 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border text-foreground transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-0 z-30 p-4 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border text-foreground transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {posters.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeIndex 
                  ? "w-12 bg-primary" 
                  : "w-2 bg-muted hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {selectedPoster && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedPoster(null)}
        >
          <div 
            className="relative w-full max-w-lg aspect-[9/16] max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPoster.src}
              alt={selectedPoster.title || "Event Result"}
              fill
              className="object-contain rounded-lg shadow-2xl"
              priority
            />
            
            <button
              onClick={() => setSelectedPoster(null)}
              className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={() => handleDownload(selectedPoster)}
                className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Download size={20} />
                Download Poster
              </button>
              <button
                onClick={() => handleShare(selectedPoster)}
                className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
