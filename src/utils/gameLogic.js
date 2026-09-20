// Formatos de partido disponibles: cuantos sets hacen falta ganar segun el
// total de sets del formato (Bo3 = mejor de 3 = gana quien llegue a 2).
export const MATCH_FORMATS = {
  bo1: { label: 'Bo1', totalSets: 1, setsToWin: 1 },
  bo3: { label: 'Bo3', totalSets: 3, setsToWin: 2 },
  bo5: { label: 'Bo5', totalSets: 5, setsToWin: 3 },
  bo7: { label: 'Bo7', totalSets: 7, setsToWin: 4 },
}

export const POINTS_OPTIONS = [7, 11, 21]

export const DEFAULT_MATCH_FORMAT = 'bo3'
export const DEFAULT_POINTS_TO_WIN = 11

const MIN_LEAD = 2

export function getSetsToWin(matchFormat) {
  return (MATCH_FORMATS[matchFormat] ?? MATCH_FORMATS[DEFAULT_MATCH_FORMAT]).setsToWin
}

// Un set termina cuando alguien llega a pointsToWin (o mas) y le saca al
// menos 2 de ventaja (por eso en 10-10 a 11 el set se extiende hasta que
// aparezca esa ventaja de 2, sin importar si el limite es 7, 11 o 21).
export function getSetWinner(player1Points, player2Points, pointsToWin = DEFAULT_POINTS_TO_WIN) {
  const maxPoints = Math.max(player1Points, player2Points)
  const diff = Math.abs(player1Points - player2Points)

  if (maxPoints >= pointsToWin && diff >= MIN_LEAD) {
    return player1Points > player2Points ? 'player1' : 'player2'
  }
  return null
}

export function getMatchWinner(sets, matchFormat = DEFAULT_MATCH_FORMAT) {
  const setsToWin = getSetsToWin(matchFormat)
  const setsWon = countSetsWon(sets)
  if (setsWon.player1 >= setsToWin) return 'player1'
  if (setsWon.player2 >= setsToWin) return 'player2'
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
export function computeMatchState(
  events,
  { matchFormat = DEFAULT_MATCH_FORMAT, pointsToWin = DEFAULT_POINTS_TO_WIN } = {}
) {
  let sets = []
  let currentPoints = { player1: 0, player2: 0 }
  let setNumber = 1

  for (const scorer of events) {
    currentPoints = { ...currentPoints, [scorer]: currentPoints[scorer] + 1 }
    const setWinner = getSetWinner(currentPoints.player1, currentPoints.player2, pointsToWin)

    if (setWinner) {
      sets.push({
        setNumber,
        player1Points: currentPoints.player1,
        player2Points: currentPoints.player2,
        winner: setWinner,
      })
      setNumber += 1
      currentPoints = { player1: 0, player2: 0 }

      if (getMatchWinner(sets, matchFormat)) break
    }
  }

  return {
    sets,
    currentPoints,
    currentSetNumber: setNumber,
    matchWinner: getMatchWinner(sets, matchFormat),
  }
}
