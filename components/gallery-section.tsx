"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronRight } from "lucide-react"

const galleryImages = [
  {
    id: 1,
    src: "/art-exhibition-opening-night-crowd.jpg",
    title: "Opening Ceremony",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    src: "/basketball-action.png",
    title: "Basketball Finals",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    src: "/dance-performance-stage.png",
    title: "Dance Competition",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "/painting-artwork-gallery.jpg",
    title: "Art Gallery",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    src: "/football-match-celebration.jpg",
    title: "Football Victory",
    span: "col-span-2 row-span-1",
  },
  {
    id: 6,
    src: "/vibrant-concert-stage.png",
    title: "Live Concert",
    span: "col-span-1 row-span-1",
  },
]

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null)

  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Gallery</h2>
            <p className="mt-2 text-muted-foreground">Moments captured from previous events</p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ChevronRight size={16} />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className={`group relative rounded-xl overflow-hidden cursor-pointer ${image.span}`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-medium text-foreground">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-foreground hover:text-muted-foreground transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative max-w-5xl max-h-[80vh] aspect-video">
            <Image
              src={selectedImage.src || "/placeholder.svg"}
              alt={selectedImage.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}
