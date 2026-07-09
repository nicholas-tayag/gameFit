import { axisSkillWeights, emptySkillScores, frictionSkillWeights, skillCopy, skillTags } from '../data/skillTaxonomy'
import type { AxisScores, FrictionTag, GameCatalogItem, QuizOption, SkillScores, SkillTag } from '../types'

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const addWeightedSkills = (
  scores: SkillScores,
  weights: Partial<SkillScores>,
  multiplier: number,
) => {
  for (const skill of skillTags) {
    scores[skill] += (weights[skill] ?? 0) * multiplier
  }
}

export const normalizeSkillScores = (rawScores: SkillScores): SkillScores => {
  const values = skillTags.map((skill) => rawScores[skill])
  const max = Math.max(...values, 1)

  return skillTags.reduce((scores, skill) => {
    scores[skill] = clampScore((rawScores[skill] / max) * 100)
    return scores
  }, emptySkillScores())
}

export const buildSkillProfileFromAnswers = (options: QuizOption[]): SkillScores => {
  const rawScores = emptySkillScores()

  for (const option of options) {
    addWeightedSkills(rawScores, axisSkillWeights.micro, Math.max(0, option.deltas.micro))
    addWeightedSkills(rawScores, axisSkillWeights.meso, Math.max(0, option.deltas.meso))
    addWeightedSkills(rawScores, axisSkillWeights.macro, Math.max(0, option.deltas.macro))

    for (const tag of option.likes ?? []) {
      addWeightedSkills(rawScores, frictionSkillWeights[tag], 2.4)
    }

    if (option.skillDeltas) {
      addWeightedSkills(rawScores, option.skillDeltas, 3)
    }
  }

  return normalizeSkillScores(rawScores)
}

export const inferGameSkillProfile = (game: GameCatalogItem): SkillScores => {
  const rawScores = emptySkillScores()

  addWeightedSkills(rawScores, axisSkillWeights.micro, game.axes.micro)
  addWeightedSkills(rawScores, axisSkillWeights.meso, game.axes.meso)
  addWeightedSkills(rawScores, axisSkillWeights.macro, game.axes.macro)

  for (const tag of game.frictionTags) {
    addWeightedSkills(rawScores, frictionSkillWeights[tag], 26)
  }

  if (game.skillProfile) {
    addWeightedSkills(rawScores, game.skillProfile, 1.2)
  }

  return normalizeSkillScores(rawScores)
}

export const skillVectorDistance = (profile: SkillScores, gameSkills: SkillScores) => {
  const squared = skillTags.reduce((total, skill) => total + (profile[skill] - gameSkills[skill]) ** 2, 0)
  return Math.sqrt(squared / skillTags.length)
}

export const skillFitScore = (profile: SkillScores, gameSkills: SkillScores) =>
  clampScore(100 - skillVectorDistance(profile, gameSkills) / 1.15)

export const topSkillMatches = (
  profile: SkillScores,
  gameSkills: SkillScores,
  limit = 3,
): SkillTag[] =>
  skillTags
    .map((skill) => ({
      skill,
      sharedStrength: Math.min(profile[skill], gameSkills[skill]),
    }))
    .toSorted((a, b) => b.sharedStrength - a.sharedStrength || skillCopy[a.skill].label.localeCompare(skillCopy[b.skill].label))
    .slice(0, limit)
    .map((item) => item.skill)

export const describeSkillMatches = (skills: SkillTag[]) =>
  skills.map((skill) => `${skillCopy[skill].label}: ${skillCopy[skill].description}`)

export const frictionFit = (gameTags: FrictionTag[], likedTags: FrictionTag[], dislikedTags: FrictionTag[]) => {
  const liked = new Set(likedTags)
  const disliked = new Set(dislikedTags)
  const likedBonus = gameTags.reduce((bonus, tag) => bonus + (liked.has(tag) ? 4 : 0), 0)
  const dislikedPenalty = gameTags.reduce((penalty, tag) => penalty + (disliked.has(tag) ? 6 : 0), 0)

  return { likedBonus, dislikedPenalty }
}

export const axisSimilarityScore = (profile: AxisScores, gameAxes: AxisScores) => {
  const squared = (['micro', 'meso', 'macro'] as const).reduce(
    (total, axis) => total + (profile[axis] - gameAxes[axis]) ** 2,
    0,
  )
  return Math.max(0, 100 - Math.sqrt(squared) / 1.55)
}
