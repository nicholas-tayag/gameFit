import { describe, expect, it } from 'vitest'
import { buildTasteSeedInsight, findTasteSeedGame } from './tasteSeed'

describe('findTasteSeedGame', () => {
  it('recognizes exact titles and common shorthand', () => {
    expect(findTasteSeedGame('Hades')?.id).toBe('hades')
    expect(findTasteSeedGame('BG3')?.id).toBe('baldurs-gate-3')
    expect(findTasteSeedGame('totk')?.id).toBe('zelda-totk')
  })
})

describe('buildTasteSeedInsight', () => {
  it('averages recognized game axes into a pre-quiz read', () => {
    const insight = buildTasteSeedInsight(['Hades', 'Rocket League', "Baldur's Gate 3"])

    expect(insight.matchedGames.map((game) => game.id)).toEqual([
      'hades',
      'rocket-league',
      'baldurs-gate-3',
    ])
    expect(insight.scores.micro).toBeGreaterThan(50)
    expect(insight.summary).toContain('These games hint at')
  })

  it('keeps unknown games as roadmap signal instead of inventing matches', () => {
    const insight = buildTasteSeedInsight(['Some Future Indie'])

    expect(insight.matchedGames).toHaveLength(0)
    expect(insight.unmatchedEntries).toEqual(['Some Future Indie'])
    expect(insight.scores).toEqual({ micro: 50, meso: 50, macro: 50 })
  })
})
