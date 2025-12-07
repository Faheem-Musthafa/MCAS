"use client"

import { useEffect, useState, useCallback } from "react"

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  speedX: number
  speedY: number
  rotationSpeed: number
  shape: "circle" | "square" | "star"
  opacity: number
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  particleCount?: number
}

const COLORS = [
  "#FFD1DC", // Pink
  "#C1E1FF", // Blue
  "#E6CEF2", // Purple
  "#D4F0F0", // Green/Teal
  "#FFF5BA", // Yellow
  "#FF8FAB", // Accent pink
  "#98D6D6", // Sports teal
  "#C9A9E0", // Dark purple
]

const createParticle = (id: number, width: number): Particle => {
  const shapes: Particle["shape"][] = ["circle", "square", "star"]
  return {
    id,
    x: Math.random() * width,
    y: -20 - Math.random() * 100,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 10,
    speedX: (Math.random() - 0.5) * 4,
    speedY: 3 + Math.random() * 4,
    rotationSpeed: (Math.random() - 0.5) * 10,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    opacity: 0.8 + Math.random() * 0.2,
  }
}

export function Confetti({ isActive, duration = 4000, particleCount = 80 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const startConfetti = useCallback(() => {
    if (dimensions.width === 0) return

    // Create initial burst of particles with unique IDs
    const initialParticles: Particle[] = []
    const baseId = Date.now()
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push(createParticle(baseId + i, dimensions.width))
    }
    setParticles(initialParticles)

    // Add more particles over time with unique IDs
    let addedCount = 0
    const addInterval = setInterval(() => {
      if (addedCount >= particleCount / 2) {
        clearInterval(addInterval)
        return
      }
      const uniqueId = baseId + particleCount + addedCount + Math.random() * 10000
      setParticles(prev => [
        ...prev,
        createParticle(uniqueId, dimensions.width)
      ])
      addedCount++
    }, 50)

    // Clear all particles after duration
    setTimeout(() => {
      clearInterval(addInterval)
      setParticles([])
    }, duration)
  }, [dimensions.width, duration, particleCount])

  useEffect(() => {
    if (isActive && dimensions.width > 0) {
      startConfetti()
    }
  }, [isActive, startConfetti, dimensions.width])

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return

    const animate = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            rotation: p.rotation + p.rotationSpeed,
            speedY: p.speedY + 0.1, // gravity
            opacity: p.y > dimensions.height * 0.7 ? p.opacity * 0.98 : p.opacity,
          }))
          .filter(p => p.y < dimensions.height + 50 && p.opacity > 0.1)
      )
    }

    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [particles, dimensions.height])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            transition: "none",
          }}
        >
          {particle.shape === "circle" && (
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === "square" && (
            <div
              className="w-full h-full rounded-sm"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === "star" && (
            <svg viewBox="0 0 24 24" fill={particle.color} className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
