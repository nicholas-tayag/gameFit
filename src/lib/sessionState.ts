export type ActiveGamefitStage = 'landing' | 'quiz' | 'results'
export type PersistedGamefitStage = ActiveGamefitStage | 'taste-seed'

export interface RestoredGamefitState {
  answers: Record<string, string>
  currentIndex: number
  dislikedGameId: string
  topGames: string[]
  stage: ActiveGamefitStage
}

interface RestoreOptions {
  defaultDislikedGameId: string
  defaultStage?: ActiveGamefitStage
  defaultTopGames: string[]
  quizLength: number
}

const allowedStages = new Set<PersistedGamefitStage>(['landing', 'taste-seed', 'quiz', 'results'])

export function restoreSavedState(
  raw: Partial<{ stage: PersistedGamefitStage } & RestoredGamefitState> | null | undefined,
  options: RestoreOptions,
): RestoredGamefitState {
  const fallbackStage = options.defaultStage ?? 'landing'
  const stage = normalizeStage(raw?.stage, fallbackStage)
  const maxIndex = Math.max(0, options.quizLength - 1)

  return {
    answers: normalizeAnswers(raw?.answers),
    currentIndex: clampInteger(raw?.currentIndex, 0, maxIndex),
    dislikedGameId:
      typeof raw?.dislikedGameId === 'string' && raw.dislikedGameId.trim()
        ? raw.dislikedGameId
        : options.defaultDislikedGameId,
    topGames: normalizeTopGames(raw?.topGames, options.defaultTopGames),
    stage: stage === 'taste-seed' ? 'landing' : stage,
  }
}

function normalizeAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, item]) => Boolean(key.trim()) && typeof item === 'string' && item.trim().length > 0,
    ),
  )
}

function normalizeStage(value: unknown, fallback: PersistedGamefitStage): PersistedGamefitStage {
  return typeof value === 'string' && allowedStages.has(value as PersistedGamefitStage)
    ? (value as PersistedGamefitStage)
    : fallback
}

function normalizeTopGames(value: unknown, defaults: string[]): string[] {
  if (!Array.isArray(value)) return defaults
  const trimmed = value
    .slice(0, defaults.length)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
  while (trimmed.length < defaults.length) trimmed.push(defaults[trimmed.length] ?? '')
  return trimmed
}

function clampInteger(value: unknown, min: number, max: number) {
  const numeric = Number(value)
  if (!Number.isInteger(numeric)) return min
  return Math.max(min, Math.min(max, numeric))
}
