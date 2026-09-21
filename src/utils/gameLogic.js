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

export const DEFAULT_FIRST_SERVER = 'player1'

// El saque se deriva siempre del puntaje actual del set, nunca se guarda
// como estado aparte (asi no hay forma de que se desincronice de los
// puntos reales, ni siquiera al usar "deshacer").
//
// Regla oficial: cada jugador saca 2 puntos seguidos, alternando, hasta
// que el marcador empata en (pointsToWin - 1) puntos cada uno (ej. 10-10
// a 11); de ahi en adelante el saque alterna de a 1 punto. Una vez que el
// marcador esta empatado en ese umbral, la diferencia nunca puede volver
// a superar 1 hasta que el set termine, asi que "ambos llegaron al menos
// al umbral" equivale exactamente a "hubo un empate en el umbral".
export function getCurrentServer(currentPoints, firstServer = DEFAULT_FIRST_SERVER, pointsToWin = DEFAULT_POINTS_TO_WIN) {
  const deuceThreshold = pointsToWin - 1
  const totalPoints = currentPoints.player1 + currentPoints.player2
  const otherPlayer = firstServer === 'player1' ? 'player2' : 'player1'
  const inDeuce = Math.min(currentPoints.player1, currentPoints.player2) >= deuceThreshold

  // "Turno" de saque: antes del empate, cada turno dura 2 puntos: turno =
  // floor(totalPoints/2). En el empate, totalPoints = 2*deuceThreshold y
  // floor(totalPoints/2) = deuceThreshold, asi que totalPoints-deuceThreshold
  // continua la misma numeracion de turnos sin saltos ni repeticiones al
  // pasar a alternar de a 1 punto.
  const turn = inDeuce ? totalPoints - deuceThreshold : Math.floor(totalPoints / 2)

  return turn % 2 === 0 ? firstServer : otherPlayer
}

// Cuantos cambios de lado automaticos ya deberian haber ocurrido a esta
// altura del partido, derivado siempre del set actual y el marcador (nunca
// guardado aparte, mismo criterio que getCurrentServer).
//
// Reglamento: los jugadores cambian de lado al terminar cada set (por eso
// currentSetNumber-1: uno por cada set ya cerrado). En el set decisivo -el
// ultimo posible segun el formato: el 3.o en Bo3, el 5.o en Bo5, el 7.o en
// Bo7- hay ademas un cambio extra a mitad de set, cuando alguno de los dos
// llega a la mitad de pointsToWin (redondeando hacia abajo: 5 a 11 puntos,
// igual que la regla oficial ITTF). En Bo1 no aplica: al ser el unico set
// no hay "set decisivo" que distinguir.
export function getAutoSwapCount(currentSetNumber, currentPoints, matchFormat = DEFAULT_MATCH_FORMAT, pointsToWin = DEFAULT_POINTS_TO_WIN) {
  let swaps = currentSetNumber - 1

  const isDecisiveSet = matchFormat !== 'bo1' && currentSetNumber === MATCH_FORMATS[matchFormat].totalSets
  if (isDecisiveSet) {
    const midpoint = Math.floor(pointsToWin / 2)
    if (Math.max(currentPoints.player1, currentPoints.player2) >= midpoint) {
      swaps += 1
    }
  }

  return swaps
}

export function getAutoSidesSwapped(currentSetNumber, currentPoints, matchFormat, pointsToWin) {
  return getAutoSwapCount(currentSetNumber, currentPoints, matchFormat, pointsToWin) % 2 === 1
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
