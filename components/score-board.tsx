"use client"

import { useEffect, useRef, useState } from "react"

const events = [
  { name: "Art Competition", team1: "Designers", team2: "Illustrators", score1: 45, score2: 42 },
  { name: "Football Match", team1: "Warriors", team2: "Titans", score1: 3, score2: 2 },
  { name: "Quiz Bowl", team1: "Scholars", team2: "Wizards", score1: 120, score2: 115 },
  { name: "Dance Battle", team1: "Movers", team2: "Shakers", score1: 88, score2: 91 },
]

export function ScoreBoard() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="score-board" ref={sectionRef} className="py-32 px-4 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-neutral-900 text-white text-xs tracking-widest uppercase rounded-full mb-4">
            Live Results
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Score Board</h2>
          <p className="text-neutral-600 max-w-lg mx-auto">
            Track the latest scores and standings from all our exciting events
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <div
              key={event.name}
              className={`group p-8 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <span className="text-xs tracking-widest uppercase text-neutral-400 font-medium">{event.name}</span>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className="text-lg font-semibold text-neutral-800">{event.team1}</p>
                  <p className="text-5xl font-bold text-neutral-900 mt-2 group-hover:text-[#2d4a5e] transition-colors">
                    {event.score1}
                  </p>
                </div>
                <div className="px-6">
                  <span className="text-2xl font-light text-neutral-300">vs</span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-semibold text-neutral-800">{event.team2}</p>
                  <p className="text-5xl font-bold text-neutral-900 mt-2 group-hover:text-[#d4a574] transition-colors">
                    {event.score2}
                  </p>
                </div>
              </div>
              <div className="mt-6 h-1 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2d4a5e] to-[#d4a574] transition-all duration-1000"
                  style={{
                    width: isVisible ? `${(event.score1 / (event.score1 + event.score2)) * 100}%` : "0%",
                    transitionDelay: `${index * 150 + 500}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
