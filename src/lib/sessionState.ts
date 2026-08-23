export type ActiveGamefitStage = 'landing' | 'quiz' | 'results'
export type PersistedGamefitStage = ActiveGamefitStage | 'taste-seed'

export interface RestoredGamefitState {
  answers: Record<string, string>
  currentIndex: number
  dislikedGameId: string
  topGames: string[]
  stage: ActiveGamefitStage
}

interface RawPersistedGamefitState extends Omit<RestoredGamefitState, 'stage'> {
  stage: PersistedGamefitStage
}

interface RestoreOptions {
  defaultDislikedGameId: string
  defaultStage?: ActiveGamefitStage
  defaultTopGames: string[]
  quizLength: number
}

const allowedStages = new Set<PersistedGamefitStage>(['landing', 'taste-seed', 'quiz', 'results'])

export function restoreSavedState(
  raw: Partial<RawPersistedGamefitState> | null | undefined,
  options: RestoreOptions,
): RestoredGamefitState {
  const fallbackStage = options.defaultStage ?? 'landing'
  const stage = normalizeStage(raw?.stage, fallbackStage)
  const maxIndex = Math.max(0, options.quizLength - 1)

  return {
    answers: normalizeAnswers(raw?.answers),
    currentIndex: clampInteger(raw?.currentIndex, 0, maxIndex),
    dislikedGameId: normalizeDislikedGameId(raw?.dislikedGameId, options.defaultDislikedGameId),
    topGames: normalizeTopGames(raw?.topGames, options.defaultTopGames),
    stage: stage === 'taste-seed' ? 'landing' : stage,
  }
}

function normalizeAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, item]) => Boolean(key.trim()) && typeof item === 'string' && item.trim().length > 0,
    ).map(([key, item]) => [key.trim(), item.trim()]),
  )
}

function normalizeStage(value: unknown, fallback: PersistedGamefitStage): PersistedGamefitStage {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim() as PersistedGamefitStage
  return allowedStages.has(trimmed) ? trimmed : fallback
}

function normalizeTopGames(value: unknown, defaults: string[]): string[] {
  if (!Array.isArray(value)) return [...defaults]
  const trimmed = value
    .slice(0, defaults.length)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
  while (trimmed.length < defaults.length) trimmed.push(defaults[trimmed.length] ?? '')
  return trimmed
}

function normalizeDislikedGameId(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function clampInteger(value: unknown, min: number, max: number) {
  if (typeof value === 'boolean') return min
  const numeric = Number(value)
  if (!Number.isInteger(numeric)) return min
  return Math.max(min, Math.min(max, numeric))
}
