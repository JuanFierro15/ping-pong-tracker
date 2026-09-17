import { countSetsWon } from './gameLogic'

// Texto plano listo para compartir por WhatsApp u otras apps, con el
// marcador en sets y el detalle set por set.
export function formatMatchResultText(match) {
  const setsWon = countSetsWon(match.sets)
  const lines = [
    `🏓 ${match.player1Name} ${setsWon.player1} - ${setsWon.player2} ${match.player2Name}`,
    ...match.sets.map((set) => `Set ${set.setNumber}: ${set.player1Points}-${set.player2Points}`),
  ]
  return lines.join('\n')
}

// Comparte el resultado con el selector nativo del celular (Web Share API)
// y, si no está disponible o fue rechazado, cae a copiar al portapapeles.
export async function shareMatchResult(match) {
  const text = formatMatchResultText(match)

  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}
