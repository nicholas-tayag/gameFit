import { describe, expect, it } from 'vitest'
import { buildProfile, describeDislikedGame, normalizeScores, recommendGames } from './recommendations'
import { quizQuestions } from '../data/quiz'

describe('normalizeScores', () => {
  it('keeps the strongest axis at 100 and shifts negative values safely', () => {
    expect(normalizeScores({ micro: -2, meso: 2, macro: 6 })).toEqual({
      micro: 11,
      meso: 56,
      macro: 100,
    })
  })

  it('handles all-neutral input as a balanced baseline', () => {
    expect(normalizeScores({ micro: 0, meso: 0, macro: 0 })).toEqual({
      micro: 50,
      meso: 50,
      macro: 50,
    })
  })
})

describe('recommendGames', () => {
  it('returns ranked recommendations with visible reasons', () => {
    const answers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[0].id]))
    const profile = buildProfile(answers)
    const recommendations = recommendGames(profile, undefined, 5)

    expect(recommendations).toHaveLength(5)
    expect(recommendations[0].matchScore).toBeGreaterThanOrEqual(recommendations[1].matchScore)
    expect(recommendations[0].reasons.join(' ')).toContain(recommendations[0].game.title)
    expect(recommendations[0].skillReasons.length).toBeGreaterThan(0)
    expect(recommendations[0].skillReasons[0]).toContain(':')
  })

  it('excludes the disliked game and surfaces mismatch language', () => {
    const answers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[1].id]))
    const profile = buildProfile(answers)
    const recommendations = recommendGames(profile, 'elden-ring', 10)
    const reflection = describeDislikedGame(profile, 'elden-ring')

    expect(recommendations.every((item) => item.game.id !== 'elden-ring')).toBe(true)
    expect(reflection).toBeTruthy()
  })
})
