const POINTS_TO_WIN_SET = 11
const MIN_LEAD = 2
const SETS_TO_WIN_MATCH = 2

// Un set termina cuando alguien llega a 11+ puntos y le saca al menos 2 de ventaja
// (por eso en 10-10 el set se extiende hasta que aparezca esa ventaja de 2).
export function getSetWinner(player1Points, player2Points) {
  const maxPoints = Math.max(player1Points, player2Points)
  const diff = Math.abs(player1Points - player2Points)

  if (maxPoints >= POINTS_TO_WIN_SET && diff >= MIN_LEAD) {
    return player1Points > player2Points ? 'player1' : 'player2'
  }
  return null
}

export function getMatchWinner(sets) {
  const setsWon = countSetsWon(sets)
  if (setsWon.player1 >= SETS_TO_WIN_MATCH) return 'player1'
  if (setsWon.player2 >= SETS_TO_WIN_MATCH) return 'player2'
  return null
}

export function countSetsWon(sets) {
  return sets.reduce(
    (acc, set) => {
      if (set.winner === 'player1') acc.player1 += 1
      if (set.winner === 'player2') acc.player2 += 1
      return acc
    },
    { player1: 0, player2: 0 }
  )
}

// El estado completo del partido (sets cerrados, puntos del set actual, ganador)
// se deriva siempre reproduciendo la lista de puntos anotados. Así "deshacer"
// es simplemente quitar el último evento y recalcular, incluso si eso reabre
// un set que acababa de cerrarse.
export function computeMatchState(events) {
  let sets = []
  let currentPoints = { player1: 0, player2: 0 }
  let setNumber = 1

  for (const scorer of events) {
    currentPoints = { ...currentPoints, [scorer]: currentPoints[scorer] + 1 }
    const setWinner = getSetWinner(currentPoints.player1, currentPoints.player2)

    if (setWinner) {
      sets.push({
        setNumber,
        player1Points: currentPoints.player1,
        player2Points: currentPoints.player2,
        winner: setWinner,
      })
      setNumber += 1
      currentPoints = { player1: 0, player2: 0 }

      if (getMatchWinner(sets)) break
    }
  }

  return {
    sets,
    currentPoints,
    currentSetNumber: setNumber,
    matchWinner: getMatchWinner(sets),
  }
}
