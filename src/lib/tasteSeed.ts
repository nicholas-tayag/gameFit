import { gameCatalog } from '../data/catalog'
import type { Axis, AxisScores, GameCatalogItem } from '../types'

const axes: Axis[] = ['micro', 'meso', 'macro']

const axisNouns: Record<Axis, string> = {
  micro: 'fast execution',
  meso: 'adaptive reads',
  macro: 'build planning',
}

const axisInsight: Record<Axis, string> = {
  micro: 'You may light up when a game lets you feel improvement directly in your hands.',
  meso: 'You may enjoy reading shifting situations and finding the right adjustment under pressure.',
  macro: 'You may like when choices compound over time and planning gives your play a clear shape.',
}

const aliases: Record<string, string> = {
  bg3: 'baldurs-gate-3',
  botw: 'breath-of-the-wild',
  civ6: 'civilization-vi',
  'civ-6': 'civilization-vi',
  'cs2': 'cities-skylines',
  lol: 'league-of-legends',
  ow2: 'overwatch-2',
  p5r: 'persona-5-royal',
  rl: 'rocket-league',
  smash: 'super-smash-bros',
  totk: 'zelda-totk',
}

const normalizeTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const compactTitle = (value: string) => normalizeTitle(value).replace(/\s/g, '')

export interface TasteSeedInsight {
  entries: string[]
  matchedGames: GameCatalogItem[]
  unmatchedEntries: string[]
  scores: AxisScores
  dominant: Axis
  secondary: Axis
  summary: string
  detail: string
}

export const findTasteSeedGame = (entry: string): GameCatalogItem | undefined => {
  const normalized = normalizeTitle(entry)
  const compact = compactTitle(entry)
  if (!normalized) return undefined

  const aliasId = aliases[normalized] ?? aliases[compact]
  if (aliasId) {
    return gameCatalog.find((game) => game.id === aliasId)
  }

  return gameCatalog.find((game) => {
    const title = normalizeTitle(game.title)
    const compactGameTitle = compactTitle(game.title)
    return title === normalized || compactGameTitle === compact || title.includes(normalized) || normalized.includes(title)
  })
}

const averageAxes = (games: GameCatalogItem[]): AxisScores => {
  if (games.length === 0) {
    return { micro: 50, meso: 50, macro: 50 }
  }

  return axes.reduce<AxisScores>(
    (scores, axis) => ({
      ...scores,
      [axis]: Math.round(games.reduce((sum, game) => sum + game.axes[axis], 0) / games.length),
    }),
    { micro: 0, meso: 0, macro: 0 },
  )
}

export const buildTasteSeedInsight = (rawEntries: string[]): TasteSeedInsight => {
  const entries = rawEntries.map((entry) => entry.trim()).filter(Boolean)
  const matchedGames = entries
    .map((entry) => findTasteSeedGame(entry))
    .filter((game): game is GameCatalogItem => Boolean(game))
  const matchedIds = new Set(matchedGames.map((game) => game.id))
  const uniqueMatchedGames = matchedGames.filter((game) => {
    if (!matchedIds.has(game.id)) return false
    matchedIds.delete(game.id)
    return true
  })
  const unmatchedEntries = entries.filter((entry) => !findTasteSeedGame(entry))
  const scores = averageAxes(uniqueMatchedGames)
  const ordered = axes.toSorted((a, b) => scores[b] - scores[a])
  const dominant = ordered[0]
  const secondary = ordered[1]

  if (entries.length === 0) {
    return {
      entries,
      matchedGames: uniqueMatchedGames,
      unmatchedEntries,
      scores,
      dominant,
      secondary,
      summary: 'Give me up to three games you already like, and I will read the first outline before the quiz.',
      detail: 'The quiz still does the real tuning. This first step just helps GameFit meet you where your taste already is.',
    }
  }

  if (uniqueMatchedGames.length === 0) {
    return {
      entries,
      matchedGames: uniqueMatchedGames,
      unmatchedEntries,
      scores,
      dominant,
      secondary,
      summary: 'I do not recognize those titles in the starter catalog yet, but that is useful signal for the roadmap.',
      detail: 'Start the quiz and GameFit will infer your shape from play scenarios instead of title matching.',
    }
  }

  const recognizedNames = uniqueMatchedGames.map((game) => game.title).join(', ')
  const unknownText =
    unmatchedEntries.length > 0
      ? ` I did not recognize ${unmatchedEntries.join(', ')} yet, so I am keeping that part flexible.`
      : ''

  return {
    entries,
    matchedGames: uniqueMatchedGames,
    unmatchedEntries,
    scores,
    dominant,
    secondary,
    summary: `These games hint at ${ordered.map((axis) => axisNouns[axis]).join(', and ')}.`,
    detail: `${recognizedNames} give me the first contour of your taste. ${axisInsight[dominant]} The quiz will tune the details.${unknownText}`,
  }
}
