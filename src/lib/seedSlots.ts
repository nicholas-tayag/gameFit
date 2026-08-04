export function applyCatalogSelection(topGames: string[], targetSlot: number, title: string) {
  const nextGames = topGames.map((game, index) => {
    if (index === targetSlot) return title
    return game.trim().toLowerCase() === title.trim().toLowerCase() ? '' : game
  })

  return nextGames
}

export function nextSeedSlot(topGames: string[], targetSlot: number) {
  const nextEmpty = topGames.findIndex((game, index) => index !== targetSlot && game.trim().length === 0)
  return nextEmpty === -1 ? Math.min(targetSlot + 1, topGames.length - 1) : nextEmpty
}
