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
          ' valid ': ' keep ',
          blank: '   ',
          numeric: 4 as never,
        },
        currentIndex: 'bad' as never,
        dislikedGameId: '  ',
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

  it('trims restored ids from persisted state', () => {
    const state = restoreSavedState(
      {
        answers: {
          ' q1 ': ' option-a ',
        },
        dislikedGameId: ' hades ',
      },
      defaults,
    )

    expect(state.answers).toEqual({ q1: 'option-a' })
    expect(state.dislikedGameId).toBe('hades')
  })

  it('restores stages saved with surrounding whitespace', () => {
    const state = restoreSavedState({ stage: ' results ' as never }, defaults)

    expect(state.stage).toBe('results')
  })

  it('copies fallback game titles before returning restored state', () => {
    const state = restoreSavedState(null, defaults)
    state.topGames[0] = 'Changed title'

    expect(defaults.defaultTopGames[0]).toBe('Hades')
  })

  it('does not treat boolean saved indices as quiz positions', () => {
    const state = restoreSavedState({ currentIndex: true as never }, defaults)

    expect(state.currentIndex).toBe(0)
  })

})
