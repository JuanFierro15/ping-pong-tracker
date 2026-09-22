import { toPng } from 'html-to-image'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
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

// Comparte el resultado del partido. Si se pasa el nodo de la tarjeta
// grafica (ShareCard), intenta generar y compartir una imagen; si eso falla
// por cualquier motivo (Capacitor no disponible, error al capturar, etc.)
// cae al resultado en texto plano vía Web Share API o portapapeles, para
// mantener compatibilidad total con la web pura.
export async function shareMatchResult(match, cardNode) {
  if (cardNode) {
    const shared = await shareMatchImage(match, cardNode).catch(() => null)
    if (shared) return shared
  }

  return shareMatchText(match)
}

async function shareMatchImage(match, cardNode) {
  const dataUrl = await toPng(cardNode, { pixelRatio: 1, width: 1080, height: 1920 })

  if (Capacitor.isNativePlatform()) {
    return shareImageNative(dataUrl)
  }

  return shareImageWeb(dataUrl)
}

async function shareImageNative(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const path = `ping-pong-resultado-${Date.now()}.png`

  const { uri } = await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache })

  await Share.share({ title: 'Resultado del partido', url: uri })
  return 'shared'
}

// En navegador (sin Capacitor) usa la Web Share API con el archivo adjunto
// si el navegador lo soporta; si no, no hay forma estandar de "compartir
// una imagen" y se cae al fallback de texto (return null).
async function shareImageWeb(dataUrl) {
  if (!navigator.share || !navigator.canShare) return null

  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], 'ping-pong-resultado.png', { type: 'image/png' })
  if (!navigator.canShare({ files: [file] })) return null

  await navigator.share({ files: [file], title: 'Resultado del partido' })
  return 'shared'
}

async function shareMatchText(match) {
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
