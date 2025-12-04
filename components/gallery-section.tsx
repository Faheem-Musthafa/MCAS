"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronRight, Loader2, Camera } from "lucide-react"
import type { DbGalleryItem } from "@/lib/supabase/types"

interface GalleryImage {
  id: string
  src: string
  title: string
  span: string
}

// Default span values for layout
const spanPatterns = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
]

export function GallerySection() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery")
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

  if (loading) {
    return (
      <section id="gallery" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-pastel" />
        <div className="flex items-center justify-center py-24 relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--art-accent)]" />
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="py-24 px-6 relative overflow-hidden">
      {/* Pastel background */}
      <div className="absolute inset-0 bg-radial-pastel" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-purple absolute -top-20 right-1/4 w-[300px] h-[300px] opacity-30" style={{ animationDelay: '1s' }} />
        <div className="blob blob-pink absolute bottom-0 left-1/4 w-[250px] h-[250px] opacity-30" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(230, 206, 242, 0.7)' }}>
                <Camera size={20} className="text-[var(--art-accent)]" />
              </div>
              <span className="text-sm font-medium text-[var(--art-text-light)]">Memories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--art-text)]">Gallery</h2>
            <p className="mt-2 text-[var(--art-text-light)]">Moments captured from previous events</p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium text-[var(--art-text)] hover:bg-white/70 transition-colors"
          >
            View All <ChevronRight size={16} />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 ${image.span}`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-medium text-white">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {galleryImages.length === 0 && (
          <div className="text-center py-12 glass-card rounded-3xl">
            <Camera className="w-12 h-12 mx-auto text-[var(--art-text-light)] mb-4" />
            <p className="text-[var(--art-text-light)]">No gallery images yet</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(253, 251, 247, 0.95)', backdropFilter: 'blur(20px)' }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 rounded-full text-[var(--art-text)] hover:bg-white/50 transition-colors"
            style={{ background: 'rgba(255, 255, 255, 0.7)' }}
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <div className="relative max-w-5xl w-full max-h-[80vh] aspect-video glass-card rounded-3xl overflow-hidden">
            <Image
              src={selectedImage.src || "/placeholder.svg"}
              alt={selectedImage.title}
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-card px-6 py-3 rounded-2xl">
            <h3 className="font-semibold text-[var(--art-text)]">{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </section>
  )
}
