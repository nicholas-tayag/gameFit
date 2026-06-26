import { gameCatalog } from '../data/catalog'
import { quizQuestions } from '../data/quiz'
import type { Axis, AxisScores, FrictionTag, Recommendation, SkillProfile } from '../types'

const axes: Axis[] = ['micro', 'meso', 'macro']

const axisLabels: Record<Axis, string> = {
  micro: 'execution-heavy challenge',
  meso: 'adaptive situation reading',
  macro: 'planning and systems mastery',
}

const unique = <T,>(items: T[]) => Array.from(new Set(items))

export const normalizeScores = (rawScores: AxisScores): AxisScores => {
  const values = axes.map((axis) => rawScores[axis])
  if (values.every((value) => value === values[0])) {
    return { micro: 50, meso: 50, macro: 50 }
  }

  const min = Math.min(...values)
  const shifted = axes.reduce<AxisScores>(
    (scores, axis) => ({ ...scores, [axis]: rawScores[axis] - min + 1 }),
    { micro: 0, meso: 0, macro: 0 },
  )
  const max = Math.max(...axes.map((axis) => shifted[axis]), 1)

  return axes.reduce<AxisScores>(
    (scores, axis) => ({ ...scores, [axis]: Math.round((shifted[axis] / max) * 100) }),
    { micro: 0, meso: 0, macro: 0 },
  )
}

export const buildProfile = (answers: Record<string, string>): SkillProfile => {
  const rawScores: AxisScores = { micro: 0, meso: 0, macro: 0 }
  const likedTags: FrictionTag[] = []
  const dislikedTags: FrictionTag[] = []

  for (const question of quizQuestions) {
    const selected = question.options.find((option) => option.id === answers[question.id])
    if (!selected) continue

    for (const axis of axes) {
      rawScores[axis] += selected.deltas[axis]
    }
    likedTags.push(...(selected.likes ?? []))
    dislikedTags.push(...(selected.dislikes ?? []))
  }

  const scores = normalizeScores(rawScores)
  const ordered = axes.toSorted((a, b) => scores[b] - scores[a])
  const dominant = ordered[0]
  const secondary = ordered[1]
  const confidence = Math.min(99, Math.max(34, Math.round((Object.keys(answers).length / quizQuestions.length) * 82 + 12)))

  return {
    scores,
    dominant,
    secondary,
    confidence,
    likedTags: unique(likedTags),
    dislikedTags: unique(dislikedTags),
    explanation: `You currently lean toward ${axisLabels[dominant]}, with ${axisLabels[secondary]} close behind.`,
  }
}

const vectorDistance = (profile: AxisScores, gameAxes: AxisScores) => {
  const squared = axes.reduce((total, axis) => total + (profile[axis] - gameAxes[axis]) ** 2, 0)
  return Math.sqrt(squared)
}

const confidenceFor = (score: number): Recommendation['confidence'] => {
  if (score >= 82) return 'High'
  if (score >= 68) return 'Medium'
  return 'Exploratory'
}

export const recommendGames = (
  profile: SkillProfile,
  dislikedGameId?: string,
  limit = 8,
): Recommendation[] => {
  const liked = new Set(profile.likedTags)
  const disliked = new Set(profile.dislikedTags)
  const dislikedGame = gameCatalog.find((game) => game.id === dislikedGameId)
  const dislikedGameTags = new Set(dislikedGame?.frictionTags ?? [])

  return gameCatalog
    .filter((game) => game.id !== dislikedGameId)
    .map((game) => {
      const distanceScore = Math.max(0, 100 - vectorDistance(profile.scores, game.axes) / 1.55)
      const likedBonus = game.frictionTags.reduce((bonus, tag) => bonus + (liked.has(tag) ? 4 : 0), 0)
      const dislikedPenalty = game.frictionTags.reduce((penalty, tag) => penalty + (disliked.has(tag) ? 6 : 0), 0)
      const dislikedGamePenalty = game.frictionTags.reduce((penalty, tag) => penalty + (dislikedGameTags.has(tag) ? 3 : 0), 0)
      const matchScore = Math.round(Math.max(1, Math.min(99, distanceScore + likedBonus - dislikedPenalty - dislikedGamePenalty)))
      const topAxes = axes.toSorted((a, b) => game.axes[b] - game.axes[a]).slice(0, 2)
      const reasons = [
        game.matchBlurbs[profile.dominant],
        `${game.title} also emphasizes ${topAxes.map((axis) => axisLabels[axis]).join(' and ')}.`,
      ]
      const cautions = game.frictionTags
        .filter((tag) => disliked.has(tag) || dislikedGameTags.has(tag))
        .slice(0, 2)
        .map((tag) => game.cautionNotes[tag] ?? `Includes ${tag.replace('-', ' ')} friction.`)

      return {
        game,
        matchScore,
        confidence: confidenceFor(matchScore),
        reasons,
        cautions,
      }
    })
    .toSorted((a, b) => b.matchScore - a.matchScore || a.game.title.localeCompare(b.game.title))
    .slice(0, limit)
}

export const describeDislikedGame = (profile: SkillProfile, dislikedGameId?: string) => {
  const game = gameCatalog.find((item) => item.id === dislikedGameId)
  if (!game) return undefined

  const gaps = axes
    .map((axis) => ({ axis, gap: game.axes[axis] - profile.scores[axis] }))
    .toSorted((a, b) => b.gap - a.gap)
    .filter((item) => item.gap > 18)

  const tagOverlap = game.frictionTags.filter((tag) => profile.dislikedTags.includes(tag))

  if (gaps.length === 0 && tagOverlap.length === 0) {
    return `${game.title} may not be a bad fit on paper; your bounce-off point might be mood, pacing, onboarding, or timing.`
  }

  const gapText = gaps.length > 0 ? `It asks for more ${axisLabels[gaps[0].axis]} than your current profile is seeking.` : ''
  const tagText = tagOverlap.length > 0 ? `It also includes friction you flagged: ${tagOverlap.map((tag) => tag.replace('-', ' ')).join(', ')}.` : ''

  return [gapText, tagText].filter(Boolean).join(' ')
}
