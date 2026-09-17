import { countSetsWon } from '../utils/gameLogic'
import { UndoIcon, XIcon } from './icons'

export default function ScoreBoard({
  player1Name,
  player2Name,
  currentPoints,
  sets,
  currentSetNumber,
  onScorePlayer1,
  onScorePlayer2,
  onUndo,
  canUndo,
  onRequestCancel,
}) {
  const setsWon = countSetsWon(sets)

  return (
    <div className="flex h-full flex-col">
      <PlayerHalf
        name={player2Name}
        points={currentPoints.player2}
        setsWon={setsWon.player2}
        colorClass="bg-player2/10 text-player2"
        rotate
        onTap={onScorePlayer2}
      />

      <div className="flex items-center justify-between gap-2 bg-surface px-3 py-2">
        <button
          type="button"
          onClick={onRequestCancel}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 active:bg-surface-2"
        >
          <XIcon className="h-3.5 w-3.5" />
          Cancelar
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Set {currentSetNumber}
          </span>
          {sets.length > 0 && (
            <span className="mt-0.5 text-[11px] text-gray-500">
              {sets.map((s) => `${s.player1Points}-${s.player2Points}`).join(' · ')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 disabled:opacity-30 active:bg-surface-2"
        >
          <UndoIcon className="h-3.5 w-3.5" />
          Deshacer
        </button>
      </div>

      <PlayerHalf
        name={player1Name}
        points={currentPoints.player1}
        setsWon={setsWon.player1}
        colorClass="bg-player1/10 text-player1"
        onTap={onScorePlayer1}
      />
    </div>
  )
}

function PlayerHalf({ name, points, setsWon, colorClass, rotate, onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`flex flex-1 flex-col items-center justify-center gap-3 ${colorClass} active:brightness-125 transition`}
      style={rotate ? { transform: 'rotate(180deg)' } : undefined}
    >
      <span className="max-w-[80%] truncate text-lg font-bold">{name}</span>
      <span key={points} className="score-pulse text-[7rem] font-black leading-none tabular-nums">
        {points}
      </span>
      <SetDots won={setsWon} />
      <span className="text-xs text-gray-500">Toca para sumar punto</span>
    </button>
  )
}

function SetDots({ won }) {
  return (
    <div className="flex gap-2">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < won ? 'bg-current' : 'bg-current/20'}`}
        />
      ))}
    </div>
  )
}
