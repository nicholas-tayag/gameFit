export type Axis = 'micro' | 'meso' | 'macro'

export type AxisScores = Record<Axis, number>

export type FrictionTag =
  | 'precision'
  | 'punishing'
  | 'pattern-reading'
  | 'experimentation'
  | 'resource-planning'
  | 'buildcraft'
  | 'team-pressure'
  | 'open-ended'
  | 'story-density'
  | 'speed'
  | 'grind'
  | 'navigation'
  | 'stealth'
  | 'systems'

export interface QuizOption {
  id: string
  label: string
  description: string
  deltas: AxisScores
  likes?: FrictionTag[]
  dislikes?: FrictionTag[]
}

export interface QuizQuestion {
  id: string
  prompt: string
  context: string
  options: QuizOption[]
}

export interface SkillProfile {
  scores: AxisScores
  dominant: Axis
  secondary: Axis
  confidence: number
  explanation: string
  likedTags: FrictionTag[]
  dislikedTags: FrictionTag[]
}

export interface GameCatalogItem {
  id: string
  title: string
  platforms: string[]
  genres: string[]
  axes: AxisScores
  frictionTags: FrictionTag[]
  difficultyFeel: string
  sessionLength: string
  matchBlurbs: Record<Axis, string>
  cautionNotes: Partial<Record<FrictionTag, string>>
  color: string
}

export interface Recommendation {
  game: GameCatalogItem
  matchScore: number
  confidence: 'High' | 'Medium' | 'Exploratory'
  reasons: string[]
  cautions: string[]
}
