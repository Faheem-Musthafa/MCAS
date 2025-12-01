// Shared data store for CRUD operations
// In a real app, this would be a database

export type Event = {
  id: number
  title: string
  venue: string
  date: string
  category: "ART" | "SPORTS"
  image: string
}

export type Team = {
  id: number
  name: string
  category: "ART" | "SPORTS"
  department: string
  logo: string
  color: string
  wins: number
  podiums: number
}

export type Score = {
  id: number
  eventId: number
  teamId: number
  judgeScores: { judgeId: number; score: number; criteria: string }[]
  totalScore: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  submittedBy: number // judgeId
}

export type Judge = {
  id: number
  name: string
  expertise: string
  image: string
  accessCode: string // Added access code for judge login
}

export type GalleryItem = {
  id: number
  src: string
  title: string
  span: string
}

export type ScoringCriteria = {
  id: number
  name: string
  maxScore: number
  category: "ART" | "SPORTS"
}

export const scoringCriteria: ScoringCriteria[] = [
  { id: 1, name: "Creativity", maxScore: 100, category: "ART" },
  { id: 2, name: "Technique", maxScore: 100, category: "ART" },
  { id: 3, name: "Presentation", maxScore: 100, category: "ART" },
  { id: 4, name: "Performance", maxScore: 100, category: "SPORTS" },
  { id: 5, name: "Teamwork", maxScore: 100, category: "SPORTS" },
  { id: 6, name: "Sportsmanship", maxScore: 100, category: "SPORTS" },
]

// Initial data
export const initialEvents: Event[] = [
  {
    id: 1,
    title: "Art Exhibition",
    venue: "Gallery Hall",
    date: "DEC 15-16",
    category: "ART",
    image: "/art-exhibition-gallery-colorful-paintings.jpg",
  },
  {
    id: 2,
    title: "Football Championship",
    venue: "Sports Complex",
    date: "DEC 17",
    category: "SPORTS",
    image: "/football-match-stadium-night-lights.jpg",
  },
  {
    id: 3,
    title: "Music Performance",
    venue: "Auditorium",
    date: "DEC 18",
    category: "ART",
    image: "/concert-stage-lights.png",
  },
  {
    id: 4,
    title: "Basketball Finals",
    venue: "Indoor Stadium",
    date: "DEC 19-20",
    category: "SPORTS",
    image: "/basketball-game-indoor-court-action.jpg",
  },
]

export const initialTeams: Team[] = [
  {
    id: 1,
    name: "Phoenix Rising",
    category: "SPORTS",
    department: "Computer Science",
    logo: "/phoenix-logo-red.jpg",
    color: "#ef4444",
    wins: 3,
    podiums: 5,
  },
  {
    id: 2,
    name: "Blue Thunder",
    category: "SPORTS",
    department: "Electronics",
    logo: "/thunder-logo-blue.jpg",
    color: "#3b82f6",
    wins: 2,
    podiums: 4,
  },
  {
    id: 3,
    name: "Creative Minds",
    category: "ART",
    department: "Fine Arts",
    logo: "/art-palette-logo-purple.jpg",
    color: "#8b5cf6",
    wins: 4,
    podiums: 6,
  },
  {
    id: 4,
    name: "Artistic Souls",
    category: "ART",
    department: "Design",
    logo: "/creative-brush-logo-green.jpg",
    color: "#22c55e",
    wins: 1,
    podiums: 3,
  },
  {
    id: 5,
    name: "Golden Warriors",
    category: "SPORTS",
    department: "Mechanical",
    logo: "/warrior-shield-logo-gold.jpg",
    color: "#eab308",
    wins: 2,
    podiums: 4,
  },
  {
    id: 6,
    name: "Visual Vibes",
    category: "ART",
    department: "Architecture",
    logo: "/eye-art-logo-pink.jpg",
    color: "#ec4899",
    wins: 0,
    podiums: 2,
  },
]

export const initialJudges: Judge[] = [
  {
    id: 1,
    name: "Dr. Amanda Wright",
    expertise: "Fine Arts",
    image: "/professional-woman-judge-portrait.jpg",
    accessCode: "JUDGE001",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    expertise: "Sports Analytics",
    image: "/professional-asian-man-judge-portrait.jpg",
    accessCode: "JUDGE002",
  },
  {
    id: 3,
    name: "Sarah Martinez",
    expertise: "Performance Arts",
    image: "/professional-latina-woman-judge-portrait.jpg",
    accessCode: "JUDGE003",
  },
  {
    id: 4,
    name: "James O'Connor",
    expertise: "Athletics",
    image: "/professional-man-sports-judge-portrait.jpg",
    accessCode: "JUDGE004",
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    expertise: "Music & Dance",
    image: "/professional-indian-woman-judge-portrait.jpg",
    accessCode: "JUDGE005",
  },
]

export const initialScores: Score[] = [
  {
    id: 1,
    eventId: 1,
    teamId: 3,
    judgeScores: [
      { judgeId: 1, score: 92, criteria: "Creativity" },
      { judgeId: 3, score: 88, criteria: "Technique" },
      { judgeId: 5, score: 90, criteria: "Presentation" },
    ],
    totalScore: 270,
    status: "approved",
    submittedAt: "2024-12-10T10:30:00Z",
    submittedBy: 1,
  },
  {
    id: 2,
    eventId: 1,
    teamId: 4,
    judgeScores: [
      { judgeId: 1, score: 85, criteria: "Creativity" },
      { judgeId: 3, score: 91, criteria: "Technique" },
      { judgeId: 5, score: 87, criteria: "Presentation" },
    ],
    totalScore: 263,
    status: "approved",
    submittedAt: "2024-12-10T11:00:00Z",
    submittedBy: 1,
  },
  {
    id: 3,
    eventId: 2,
    teamId: 1,
    judgeScores: [
      { judgeId: 2, score: 45, criteria: "Performance" },
      { judgeId: 4, score: 38, criteria: "Teamwork" },
    ],
    totalScore: 83,
    status: "approved",
    submittedAt: "2024-12-11T14:00:00Z",
    submittedBy: 2,
  },
  {
    id: 4,
    eventId: 2,
    teamId: 2,
    judgeScores: [
      { judgeId: 2, score: 42, criteria: "Performance" },
      { judgeId: 4, score: 40, criteria: "Teamwork" },
    ],
    totalScore: 82,
    status: "pending",
    submittedAt: "2024-12-11T14:30:00Z",
    submittedBy: 2,
  },
  {
    id: 5,
    eventId: 4,
    teamId: 1,
    judgeScores: [
      { judgeId: 2, score: 78, criteria: "Performance" },
      { judgeId: 4, score: 82, criteria: "Sportsmanship" },
    ],
    totalScore: 160,
    status: "pending",
    submittedAt: "2024-12-12T09:00:00Z",
    submittedBy: 4,
  },
  {
    id: 6,
    eventId: 4,
    teamId: 5,
    judgeScores: [
      { judgeId: 2, score: 72, criteria: "Performance" },
      { judgeId: 4, score: 75, criteria: "Sportsmanship" },
    ],
    totalScore: 147,
    status: "approved",
    submittedAt: "2024-12-12T09:30:00Z",
    submittedBy: 4,
  },
]

export const initialGallery: GalleryItem[] = [
  { id: 1, src: "/art-exhibition-opening-night-crowd.jpg", title: "Opening Ceremony", span: "col-span-2 row-span-2" },
  { id: 2, src: "/basketball-action.png", title: "Basketball Finals", span: "col-span-1 row-span-1" },
  { id: 3, src: "/dance-performance-stage.png", title: "Dance Competition", span: "col-span-1 row-span-1" },
  { id: 4, src: "/painting-artwork-gallery.jpg", title: "Art Gallery", span: "col-span-1 row-span-1" },
  { id: 5, src: "/football-match-celebration.jpg", title: "Football Victory", span: "col-span-2 row-span-1" },
  { id: 6, src: "/vibrant-concert-stage.png", title: "Live Concert", span: "col-span-1 row-span-1" },
]
