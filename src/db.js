import Dexie from 'dexie'

export const db = new Dexie('PingPongTrackerDB')

db.version(1).stores({
  matches: 'id, date',
})

export async function saveMatch(match) {
  await db.matches.put(match)
}

export async function getAllMatches() {
  const matches = await db.matches.toArray()
  return matches.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function deleteMatch(id) {
  await db.matches.delete(id)
}

export async function updateMatchPlayerNames(id, { player1Name, player2Name }) {
  await db.matches.update(id, { player1Name, player2Name })
}

function isValidSet(set) {
  return (
    set &&
    typeof set.setNumber === 'number' &&
    typeof set.player1Points === 'number' &&
    typeof set.player2Points === 'number' &&
    (set.winner === 'player1' || set.winner === 'player2')
  )
}

function isValidMatch(match) {
  return (
    match &&
    typeof match.player1Name === 'string' &&
    typeof match.player2Name === 'string' &&
    Array.isArray(match.sets) &&
    match.sets.length > 0 &&
    match.sets.every(isValidSet) &&
    (match.winner === 'player1' || match.winner === 'player2') &&
    !Number.isNaN(new Date(match.date).getTime())
  )
}

// Importa partidos desde un JSON exportado previamente. Genera un id nuevo
// para cada uno (en vez de reutilizar el original) para no pisar partidos
// existentes si el archivo se importa más de una vez.
export async function importMatches(rawMatches) {
  if (!Array.isArray(rawMatches)) {
    return { imported: 0, skipped: 0 }
  }

  const valid = rawMatches.filter(isValidMatch)
  const toInsert = valid.map((match) => ({
    id: crypto.randomUUID(),
    date: match.date,
    player1Name: match.player1Name,
    player2Name: match.player2Name,
    sets: match.sets,
    winner: match.winner,
    // Opcionales: partidos exportados antes de esta funcionalidad no los
    // traen, y el resto de la app ya asume bo3/11 por defecto si faltan.
    ...(typeof match.matchFormat === 'string' ? { matchFormat: match.matchFormat } : {}),
    ...(typeof match.pointsToWin === 'number' ? { pointsToWin: match.pointsToWin } : {}),
  }))

  await db.matches.bulkPut(toInsert)

  return { imported: toInsert.length, skipped: rawMatches.length - toInsert.length }
}
