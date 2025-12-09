"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronRight, ChevronLeft, Loader2, Camera, Sparkles, ZoomIn } from "lucide-react"
import type { DbGalleryItem } from "@/lib/supabase/types"
import { FEST_CONFIG } from "@/lib/supabase/types"

interface GalleryImage {
  id: string
  src: string
  title: string
  span: string
}

// Default span values for layout - creates visual interest
const spanPatterns = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
]

export function GallerySection() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] : null

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery?type=photo")
        if (res.ok) {
          const data: DbGalleryItem[] = await res.json()
          const images = data.map((item, index) => ({
            id: item.id,
            src: item.src,
            title: item.title,
            span: spanPatterns[index % spanPatterns.length],
          }))
          setGalleryImages(images)
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return
    if (e.key === "ArrowRight") {
      setSelectedIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowLeft") {
      setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Escape") {
      setSelectedIndex(null)
    }
  }, [selectedIndex, galleryImages.length])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const navigateTo = (direction: "prev" | "next") => {
    if (selectedIndex === null) return
    if (direction === "next" && selectedIndex < galleryImages.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    } else if (direction === "prev" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (loading) {
    return (
      <section id="gallery" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-pastel" />
        <div className="flex flex-col items-center justify-center py-24 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--art-purple)] to-[var(--art-pink)] blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 animate-spin text-[var(--art-accent)]" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading gallery...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="relative overflow-hidden bg-gradient-to-b from-transparent via-muted/20 to-transparent">
      {/* Floating elements for seamless feel - hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--art-purple)]/10 blur-[100px] animate-pulse" />
      </div>
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-purple absolute -top-20 right-1/4 w-[350px] h-[350px] opacity-25" style={{ animationDelay: '1s' }} />
        <div className="blob blob-pink absolute bottom-0 left-1/4 w-[300px] h-[300px] opacity-25" style={{ animationDelay: '3s' }} />
        <div className="blob blob-yellow absolute top-1/2 -right-20 w-[200px] h-[200px] opacity-20" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-14 gap-4 md:gap-6">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(230, 206, 242, 0.8), rgba(255, 209, 220, 0.8))' }}>
                <Camera size={18} className="md:hidden text-[var(--art-accent)]" />
                <Camera size={24} className="hidden md:block text-[var(--art-accent)]" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles size={10} className="md:hidden text-[var(--art-accent)]" />
                <Sparkles size={12} className="hidden md:block text-[var(--art-accent)]" />
                Captured Memories
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-1 md:mb-2">
              Photo <span className="gradient-text">Gallery</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md">
              Capturing the best moments of {FEST_CONFIG.name}
            </p>
          </div>
          <a
            href="#events"
            className="group inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 glass-readable rounded-full text-sm md:text-base font-bold text-foreground hover:shadow-xl transition-all duration-300 active:scale-95 lg:hover:scale-105 btn-readable focus-visible-enhanced"
          >
            Browse Events
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Gallery Grid - simpler on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[220px]">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 md:duration-500 animate-scale-in touch-feedback ${
                // Simplify spans on mobile
                index % 6 === 0 ? "md:col-span-2 md:row-span-2" : ""
              } ${image.span.includes("col-span-2") && index % 6 !== 0 ? "" : image.span}`}
              style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              {/* Overlay - simplified on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:duration-500" />
              
              {/* Zoom icon - desktop only */}
              <div className="hidden md:block absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="p-2 rounded-full bg-white/90 shadow-lg">
                  <ZoomIn size={18} className="text-foreground" />
                </div>
              </div>
              
              {/* Title - always visible on mobile, hover on desktop */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:duration-500 md:transform md:translate-y-4 md:group-hover:translate-y-0">
                <h3 className="font-bold text-white text-sm md:text-lg drop-shadow-lg line-clamp-1">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {galleryImages.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(230, 206, 242, 0.5)' }}>
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Gallery photos will appear here once events start. Stay tuned!
            </p>
          </div>
        )}
      </div>

      {/* Premium Lightbox - Optimized for mobile */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 md:top-6 right-4 md:right-6 p-2.5 md:p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 z-10 touch-feedback"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={24} />
          </button>

          {/* Navigation arrows - larger touch targets on mobile */}
          {selectedIndex !== null && selectedIndex > 0 && (
            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 z-10 touch-feedback"
              onClick={(e) => { e.stopPropagation(); navigateTo("prev") }}
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {selectedIndex !== null && selectedIndex < galleryImages.length - 1 && (
            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 z-10 touch-feedback"
              onClick={(e) => { e.stopPropagation(); navigateTo("next") }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Image container */}
          <div 
            className="relative max-w-6xl w-full max-h-[80vh] mx-2 md:mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/10' }}>
              <Image
                src={selectedImage.src || "/placeholder.svg"}
                alt={selectedImage.title}
                fill
                className="object-contain bg-black/50"
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          </div>

          {/* Caption - simplified on mobile */}
          <div className="absolute bottom-16 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto glass-card px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl animate-slide-up">
            <h3 className="font-bold text-foreground text-sm md:text-lg text-center line-clamp-1">{selectedImage.title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center mt-0.5 md:mt-1">
              {(selectedIndex ?? 0) + 1} / {galleryImages.length}
              <span className="hidden md:inline"> • Use arrow keys to navigate</span>
            </p>
          </div>

          {/* Thumbnail strip - hidden on mobile for simplicity */}
          {galleryImages.length > 1 && (
            <div className="hidden md:flex absolute bottom-28 left-1/2 -translate-x-1/2 gap-2 px-4 py-3 glass-card rounded-2xl max-w-xl overflow-x-auto">
              {galleryImages.slice(0, 8).map((img, idx) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx) }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                    idx === selectedIndex ? "ring-2 ring-[var(--art-accent)] scale-110" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img.src} alt={img.title} fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setSelectedIndex(null)} 
          />
        </div>
      )}
    </section>
  )
}
