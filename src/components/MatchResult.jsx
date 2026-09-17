import { countSetsWon } from '../utils/gameLogic'
import { TrophyIcon } from './icons'

const CONFETTI_COLORS = ['#f97316', '#eef2ea', '#f59e0b', '#15803d', '#fb923c']
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 6.3) % 100,
  delay: (i % 8) * 0.18,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

export default function MatchResult({ player1Name, player2Name, sets, winner, onNewMatch }) {
  const setsWon = countSetsWon(sets)
  const winnerName = winner === 'player1' ? player1Name : player2Name

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden p-6 text-center">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${c.left}%`, backgroundColor: c.color, animationDelay: `${c.delay}s` }}
        />
      ))}

      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Partido terminado</p>
        <h1 className="mt-2 flex items-center justify-center gap-2 text-3xl font-extrabold text-gray-100">
          <TrophyIcon className="h-7 w-7 text-accent" />
          {winnerName} gana
        </h1>
        <p className="mt-1 text-lg text-gray-400">
          {setsWon.player1} - {setsWon.player2} en sets
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2 rounded-2xl bg-surface p-4">
        {sets.map((set) => (
          <div
            key={set.setNumber}
            className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3 text-base"
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

      <button
        type="button"
        onClick={onNewMatch}
        className="w-full max-w-sm rounded-2xl bg-accent py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 active:scale-95 transition"
      >
        Nuevo partido
      </button>
    </div>
  )
}
