import { countSetsWon } from './gameLogic'

function normalizeKey(name) {
  return name.trim().toLowerCase()
}

// Totales individuales de cada jugador a través de todo el historial,
// agrupando por nombre (sin distinguir mayúsculas/minúsculas ni espacios).
export function getPlayerTotals(matches) {
  const totals = new Map()

  for (const match of matches) {
    for (const side of ['player1', 'player2']) {
      const rawName = side === 'player1' ? match.player1Name : match.player2Name
      const name = rawName.trim()
      if (!name) continue

      const key = normalizeKey(name)
      if (!totals.has(key)) {
        totals.set(key, { name, matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0 })
      }
      const t = totals.get(key)
      t.name = name
      t.matchesPlayed += 1
      if (match.winner === side) t.matchesWon += 1

      const sets = countSetsWon(match.sets)
      t.setsWon += side === 'player1' ? sets.player1 : sets.player2
      t.setsLost += side === 'player1' ? sets.player2 : sets.player1
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.matchesPlayed - a.matchesPlayed)
}

// Récord cara a cara por cada pareja de jugadores que se ha enfrentado
// (agrupa "Ana vs Luis" y "Luis vs Ana" como el mismo enfrentamiento).
export function getHeadToHeadStats(matches) {
  const pairs = new Map()

  for (const match of matches) {
    const nameA = match.player1Name.trim()
    const nameB = match.player2Name.trim()
    const keyA = normalizeKey(nameA)
    const keyB = normalizeKey(nameB)
    if (!keyA || !keyB || keyA === keyB) continue

    const pairKey = [keyA, keyB].sort().join('|')
    if (!pairs.has(pairKey)) {
      pairs.set(pairKey, { names: {}, wins: {}, setsWon: {}, totalMatches: 0, results: [] })
    }
    const entry = pairs.get(pairKey)
    entry.names[keyA] = nameA
    entry.names[keyB] = nameB
    entry.wins[keyA] ??= 0
    entry.wins[keyB] ??= 0
    entry.setsWon[keyA] ??= 0
    entry.setsWon[keyB] ??= 0
    entry.totalMatches += 1

    const winnerKey = match.winner === 'player1' ? keyA : keyB
    entry.wins[winnerKey] += 1
    entry.results.push({ date: match.date, winnerKey })

    const sets = countSetsWon(match.sets)
    entry.setsWon[keyA] += sets.player1
    entry.setsWon[keyB] += sets.player2
  }

  return Array.from(pairs.values())
    .map((entry) => {
      const [keyA, keyB] = Object.keys(entry.names)
      const chronological = [...entry.results].sort((a, b) => new Date(a.date) - new Date(b.date))
      const streak = getCurrentStreak(chronological)

      return {
        playerA: entry.names[keyA],
        playerB: entry.names[keyB],
        winsA: entry.wins[keyA],
        winsB: entry.wins[keyB],
        setsA: entry.setsWon[keyA],
        setsB: entry.setsWon[keyB],
        totalMatches: entry.totalMatches,
        streak: streak && { name: entry.names[streak.key], count: streak.count },
      }
    })
    .sort((a, b) => b.totalMatches - a.totalMatches)
}

// Cuántas victorias seguidas lleva, a día de hoy, quien ganó el
// enfrentamiento más reciente entre esa pareja.
function getCurrentStreak(chronologicalResults) {
  if (chronologicalResults.length === 0) return null

  const lastKey = chronologicalResults[chronologicalResults.length - 1].winnerKey
  let count = 0
  for (let i = chronologicalResults.length - 1; i >= 0; i -= 1) {
    if (chronologicalResults[i].winnerKey !== lastKey) break
    count += 1
  }
  return { key: lastKey, count }
}
