"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download, Share2, Loader2, Sparkles, Trophy } from "lucide-react"
import { FEST_CONFIG, type DbPosterWithEvent } from "@/lib/supabase/types"

export function PostersSection() {
  const [posters, setPosters] = useState<DbPosterWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedPoster, setSelectedPoster] = useState<DbPosterWithEvent | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const fetchPosters = useCallback(async () => {
    try {
      const res = await fetch("/api/posters")
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
    const xOffset = centerDiff * 55 // Percentage offset - adjusted for square
    const scale = isActive ? 1 : 1 - Math.abs(centerDiff) * 0.18
    const opacity = isActive ? 1 : 0.6 - Math.abs(centerDiff) * 0.15
    const zIndex = 10 - Math.abs(centerDiff)
    const rotateY = centerDiff * -12

    return {
      transform: `translateX(${xOffset}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
      filter: isActive ? 'none' : `blur(${Math.abs(centerDiff) * 1.5}px) brightness(0.6)`,
    }
  }

  return (
    <section 
      ref={sectionRef}
      id="results" 
      className="relative py-20 md:py-32 overflow-hidden bg-transparent"
    >
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-[var(--art-purple)]/15 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-[var(--art-pink)]/15 blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">Latest Achievements</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Results</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Celebrating the champions of {FEST_CONFIG.name}
          </p>
        </div>

        {/* 3D Carousel - Square format */}
        <div className="relative h-[400px] sm:h-[450px] md:h-[520px] lg:h-[580px] w-full max-w-5xl mx-auto flex items-center justify-center">
          {posters.map((poster, index) => {
            const style = getPosterStyle(index)
            if (style.display === 'none') return null

            return (
              <div
                key={poster.id}
                className="absolute w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] aspect-square transition-all duration-500 ease-out cursor-pointer"
                style={style as any}
                onClick={() => {
                  if (index === activeIndex) setSelectedPoster(poster)
                  else setActiveIndex(index)
                }}
              >
                <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-card group">
                  <Image
                    src={poster.src}
                    alt={poster.title || "Event Result"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 400px, 480px"
                    priority={index === activeIndex}
                  />
                  
                  {/* Hover Overlay for Active Item */}
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-base md:text-lg mb-3 line-clamp-2">{poster.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(poster) }}
                            className="flex-1 py-2 md:py-2.5 bg-white text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                          >
                            <Download size={16} />
                            Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShare(poster) }}
                            className="px-3 md:px-4 py-2 md:py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Active indicator glow */}
                  {index === activeIndex && (
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 blur-xl -z-10 animate-pulse" />
                  )}
                </div>
              </div>
            )
          })}

          {/* Navigation Buttons - Simplified */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:-left-4 z-30 p-2.5 md:p-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-border text-foreground transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft size={24} className="md:w-7 md:h-7" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 md:-right-4 z-30 p-2.5 md:p-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-border text-foreground transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight size={24} className="md:w-7 md:h-7" />
          </button>
        </div>

        {/* Indicators - Improved */}
        <div className="flex justify-center gap-2 mt-6 md:mt-8">
          {posters.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                index === activeIndex 
                  ? "w-8 md:w-10 bg-gradient-to-r from-primary to-secondary" 
                  : "w-1.5 bg-muted hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal - Updated for square */}
      {selectedPoster && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          onClick={() => setSelectedPoster(null)}
        >
          <div 
            className="relative w-full max-w-[90vw] md:max-w-xl aspect-square max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPoster.src}
              alt={selectedPoster.title || "Event Result"}
              fill
              className="object-contain rounded-xl md:rounded-2xl shadow-2xl"
              priority
            />
            
            <button
              onClick={() => setSelectedPoster(null)}
              className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-3">
              <button
                onClick={() => handleDownload(selectedPoster)}
                className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => handleShare(selectedPoster)}
                className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
