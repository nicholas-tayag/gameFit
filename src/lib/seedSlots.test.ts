import { describe, expect, it } from 'vitest'
import { applyCatalogSelection, nextSeedSlot } from './seedSlots'

describe('applyCatalogSelection', () => {
  it('moves a duplicate title into the active slot instead of duplicating it', () => {
    expect(applyCatalogSelection(['Hades', 'Rocket League', ''], 2, 'Hades')).toEqual([
      '',
      'Rocket League',
      'Hades',
    ])
  })
})

describe('nextSeedSlot', () => {
  it('prefers the next empty slot after a catalog selection', () => {
    expect(nextSeedSlot(['Hades', '', 'Rocket League'], 0)).toBe(1)
    expect(nextSeedSlot(['Hades', 'Balatro', 'Rocket League'], 1)).toBe(2)
  })
})
