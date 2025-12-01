"use client"

import { useEffect, useRef, useState } from "react"

const images = [
  { query: "students celebrating art competition winners podium", title: "Art Competition Finals" },
  { query: "university students playing football match stadium", title: "Football Championship" },
  { query: "students performing cultural dance colorful costumes", title: "Cultural Dance Show" },
  { query: "university quiz competition students on stage", title: "Quiz Bowl Tournament" },
  { query: "students art exhibition gallery paintings", title: "Art Exhibition" },
  { query: "university sports day students running track", title: "Sports Day" },
]

export function Gallery() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="gallery" ref={sectionRef} className="py-32 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-white text-neutral-900 text-xs tracking-widest uppercase rounded-full mb-4">
            Memories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Event Gallery</h2>
          <p className="text-neutral-400 max-w-lg mx-auto">Capturing the spirit of competition and creativity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={image.title}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <img
                src={`/.jpg?height=400&width=600&query=${encodeURIComponent(image.query)}`}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-semibold text-lg">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
