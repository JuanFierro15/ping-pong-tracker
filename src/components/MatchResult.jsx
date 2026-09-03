import { countSetsWon } from '../utils/gameLogic'

export default function MatchResult({ player1Name, player2Name, sets, winner, onNewMatch }) {
  const setsWon = countSetsWon(sets)
  const winnerName = winner === 'player1' ? player1Name : player2Name

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          Partido terminado
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-100">🏓 {winnerName} gana</h1>
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
        className="w-full max-w-sm rounded-2xl bg-emerald-600 py-5 text-xl font-bold text-white shadow-lg active:scale-95 transition"
      >
        Nuevo partido
      </button>
    </div>
  )
}
