import { useState } from 'react'
import { countSetsWon } from '../utils/gameLogic'
import { shareMatchResult } from '../utils/shareMatch'
import { ShareIcon, TrophyIcon } from './icons'

const CONFETTI_COLORS = ['#f97316', '#eef2ea', '#f59e0b', '#15803d', '#fb923c']
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 5.6) % 100,
  delay: (i % 9) * 0.16,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))
const STREAMERS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 10 + 4) % 100,
  delay: (i % 6) * 0.22,
  color: CONFETTI_COLORS[(i + 2) % CONFETTI_COLORS.length],
}))

export default function MatchResult({ player1Name, player2Name, sets, winner, onNewMatch }) {
  const setsWon = countSetsWon(sets)
  const winnerName = winner === 'player1' ? player1Name : player2Name
  const [toast, setToast] = useState(null)

  async function handleShare() {
    const result = await shareMatchResult({ player1Name, player2Name, sets })
    if (result === 'copied') {
      setToast('Resultado copiado')
      setTimeout(() => setToast(null), 2500)
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden p-6 text-center">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${c.left}%`, backgroundColor: c.color, animationDelay: `${c.delay}s` }}
        />
      ))}
      {STREAMERS.map((s, i) => (
        <span
          key={i}
          className="streamer-piece"
          style={{ left: `${s.left}%`, backgroundColor: s.color, animationDelay: `${s.delay}s` }}
        />
      ))}

      <div className="relative">
        <div className="glow-pulse absolute -inset-[18px] rounded-full bg-accent/35 blur-md" />
        <div className="trophy-in relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-surface shadow-inner">
          <span className="shine-sweep" />
          <TrophyIcon className="relative h-[38px] w-[38px] text-accent" />
        </div>
      </div>

      <div className="row-in" style={{ animationDelay: '120ms' }}>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Partido terminado</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-100">{winnerName} gana</h1>
        <p className="mt-1 text-lg text-gray-400">
          {setsWon.player1} - {setsWon.player2} en sets
        </p>
      </div>

      <div className="row-in w-full max-w-sm space-y-2 rounded-2xl bg-surface p-4" style={{ animationDelay: '220ms' }}>
        {sets.map((set, i) => (
          <div
            key={set.setNumber}
            className="row-in flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3 text-base"
            style={{ animationDelay: `${280 + i * 70}ms` }}
          >
            <span className="text-gray-400">Set {set.setNumber}</span>
            <span className="font-bold tabular-nums text-gray-100">
              <span className={set.winner === 'player1' ? 'text-player1' : ''}>
                {set.player1Points}
              </span>
              <span className="text-gray-500"> - </span>
              <span className={set.winner === 'player2' ? 'text-player2' : ''}>
                {set.player2Points}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="row-in flex w-full max-w-sm flex-col gap-3" style={{ animationDelay: '420ms' }}>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-2xl bg-surface py-4 text-base font-bold text-gray-100 active:scale-95 transition"
        >
          <ShareIcon className="h-5 w-5" />
          Compartir resultado
        </button>

        <button
          type="button"
          onClick={onNewMatch}
          className="rounded-2xl bg-accent py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 active:scale-95 transition"
        >
          Nuevo partido
        </button>
      </div>

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-surface-2 px-4 py-2 text-sm text-gray-100 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
