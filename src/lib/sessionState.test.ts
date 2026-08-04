import { describe, expect, it } from 'vitest'
import { restoreSavedState } from './sessionState'

const defaults = {
  defaultDislikedGameId: 'elden-ring',
  defaultTopGames: ['Hades', "Baldur's Gate 3", 'Rocket League'],
  quizLength: 10,
}

describe('restoreSavedState', () => {
  it('clamps stale quiz indices and collapses the retired taste-seed stage', () => {
    const state = restoreSavedState(
      {
        currentIndex: 999,
        stage: 'taste-seed' as const,
        topGames: ['Hades', ' Rocket League ', ''],
      },
      defaults,
    )

    expect(state.currentIndex).toBe(9)
    expect(state.stage).toBe('landing')
    expect(state.topGames).toEqual(['Hades', 'Rocket League', ''])
  })

  it('drops malformed answers and restores safe defaults', () => {
    const state = restoreSavedState(
      {
        answers: {
          valid: 'keep',
          blank: '   ',
          numeric: 4 as never,
        },
        currentIndex: 'bad' as never,
        dislikedGameId: '',
        stage: 'mystery' as never,
        topGames: 'not-an-array' as never,
      },
      defaults,
    )

    expect(state.answers).toEqual({ valid: 'keep' })
    expect(state.currentIndex).toBe(0)
    expect(state.dislikedGameId).toBe('elden-ring')
    expect(state.stage).toBe('landing')
    expect(state.topGames).toEqual(defaults.defaultTopGames)
  })
})
