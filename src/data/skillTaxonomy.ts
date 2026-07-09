import type { Axis, FrictionTag, SkillScores, SkillTag } from '../types'

export const skillTags: SkillTag[] = [
  'aim',
  'movement',
  'timing',
  'reaction',
  'inputPrecision',
  'patternReading',
  'positioning',
  'adaptation',
  'riskAssessment',
  'strategy',
  'resourceManagement',
  'buildPlanning',
  'mapControl',
  'teamCoordination',
]

export const emptySkillScores = (): SkillScores =>
  skillTags.reduce(
    (scores, skill) => ({
      ...scores,
      [skill]: 0,
    }),
    {} as SkillScores,
  )

export const skillCopy: Record<SkillTag, { label: string; axis: Axis; description: string }> = {
  aim: {
    label: 'Aim',
    axis: 'micro',
    description: 'Pointing accuracy, target tracking, crosshair placement, and precision under pressure.',
  },
  movement: {
    label: 'Movement',
    axis: 'micro',
    description: 'Spatial control, dodging, platforming, routing your body, and expressive traversal.',
  },
  timing: {
    label: 'Timing',
    axis: 'micro',
    description: 'Parries, jumps, combos, rhythm windows, cancels, and acting at the right frame.',
  },
  reaction: {
    label: 'Reaction',
    axis: 'micro',
    description: 'Fast response to visible threats, openings, speed changes, or sudden information.',
  },
  inputPrecision: {
    label: 'Input precision',
    axis: 'micro',
    description: 'Clean execution, mechanical consistency, and avoiding costly input mistakes.',
  },
  patternReading: {
    label: 'Pattern reading',
    axis: 'meso',
    description: 'Learning opponents, bosses, systems, or encounters through repeated behavioral cues.',
  },
  positioning: {
    label: 'Positioning',
    axis: 'meso',
    description: 'Being in the right place before the interaction resolves.',
  },
  adaptation: {
    label: 'Adaptation',
    axis: 'meso',
    description: 'Changing plans as the match, run, encounter, or puzzle state shifts.',
  },
  riskAssessment: {
    label: 'Risk assessment',
    axis: 'meso',
    description: 'Choosing when to commit, back off, trade resources, or accept uncertainty.',
  },
  strategy: {
    label: 'Strategy',
    axis: 'macro',
    description: 'Longer-horizon plans, win conditions, pacing, and optimal play patterns.',
  },
  resourceManagement: {
    label: 'Resource management',
    axis: 'macro',
    description: 'Economies, cooldowns, items, time, attention, party health, or upgrade budgets.',
  },
  buildPlanning: {
    label: 'Build planning',
    axis: 'macro',
    description: 'Loadouts, synergies, roles, decks, character builds, and progression choices.',
  },
  mapControl: {
    label: 'Map control',
    axis: 'macro',
    description: 'Routes, territory, navigation, rotations, scouting, and controlling space over time.',
  },
  teamCoordination: {
    label: 'Team coordination',
    axis: 'macro',
    description: 'Shared roles, pressure, communication, timing, and cooperative execution.',
  },
}

export const axisSkillWeights: Record<Axis, Partial<SkillScores>> = {
  micro: {
    aim: 0.82,
    movement: 0.74,
    timing: 0.9,
    reaction: 0.78,
    inputPrecision: 0.88,
  },
  meso: {
    patternReading: 0.88,
    positioning: 0.78,
    adaptation: 0.92,
    riskAssessment: 0.76,
  },
  macro: {
    strategy: 0.9,
    resourceManagement: 0.86,
    buildPlanning: 0.86,
    mapControl: 0.68,
    teamCoordination: 0.52,
  },
}

export const frictionSkillWeights: Record<FrictionTag, Partial<SkillScores>> = {
  precision: { aim: 0.62, timing: 0.7, inputPrecision: 0.82 },
  punishing: { timing: 0.42, riskAssessment: 0.7, patternReading: 0.48 },
  'pattern-reading': { patternReading: 0.92, adaptation: 0.54 },
  experimentation: { adaptation: 0.72, riskAssessment: 0.56, strategy: 0.38 },
  'resource-planning': { resourceManagement: 0.9, strategy: 0.66 },
  buildcraft: { buildPlanning: 0.96, strategy: 0.58 },
  'team-pressure': { teamCoordination: 0.92, positioning: 0.54, adaptation: 0.48 },
  'open-ended': { strategy: 0.48, mapControl: 0.58, adaptation: 0.42 },
  'story-density': { strategy: 0.3, resourceManagement: 0.24 },
  speed: { reaction: 0.82, movement: 0.54, timing: 0.42 },
  grind: { resourceManagement: 0.42, strategy: 0.28 },
  navigation: { mapControl: 0.86, positioning: 0.46 },
  stealth: { positioning: 0.76, riskAssessment: 0.64, patternReading: 0.44 },
  systems: { strategy: 0.72, buildPlanning: 0.62, resourceManagement: 0.54 },
}
