import { useEffect, useRef, useState } from 'react'
import { countSetsWon } from '../utils/gameLogic'
import { BallIcon, CheckIcon, SwapIcon, UndoIcon, XIcon } from './icons'

// Chispas que salen disparadas del número al anotar: ángulos repartidos en
// círculo, con una pequeña variación por toque para que no se vean idénticas.
function burstParticles(tick) {
  const count = 9
  return Array.from({ length: count }).map((_, i) => {
    const angle = i * (360 / count) + ((tick * 13) % 40)
    const dist = 42 + (i % 3) * 10
    const rad = (angle * Math.PI) / 180
    return {
      dx: (Math.cos(rad) * dist).toFixed(1),
      dy: (Math.sin(rad) * dist).toFixed(1),
    }
  })
}

export default function ScoreBoard({
  player1Name,
  player2Name,
  currentPoints,
  sets,
  setsToWin,
  currentSetNumber,
  currentServer,
  sidesSwapped,
  autoSwapped,
  onToggleSides,
  onScorePlayer1,
  onScorePlayer2,
  onUndo,
  canUndo,
  onRequestCancel,
}) {
  const setsWon = countSetsWon(sets)
  const [tap, setTap] = useState({ player: null, tick: 0 })
  const [setBanner, setSetBanner] = useState(null)
  const prevSetsLength = useRef(sets.length)

  useEffect(() => {
    if (sets.length > prevSetsLength.current) {
      const finished = sets[sets.length - 1]
      const winnerName = finished.winner === 'player1' ? player1Name : player2Name
      setSetBanner(
        `Set ${finished.setNumber}: ${winnerName} gana ${finished.player1Points}-${finished.player2Points}`
      )
      const timer = setTimeout(() => setSetBanner(null), 2200)
      prevSetsLength.current = sets.length
      return () => clearTimeout(timer)
    }
    prevSetsLength.current = sets.length
  }, [sets, player1Name, player2Name])

  // Aviso breve solo cuando el cambio de lado lo dispara la regla
  // automatica: si el usuario lo hace con el boton manual ya sabe por que.
  // Por eso este efecto mira autoSwapped (la regla sola) y no sidesSwapped
  // (que ya incluye el toggle manual) — si mirara sidesSwapped, tocar el
  // boton manual tambien dispararia el aviso.
  const [sideToast, setSideToast] = useState(false)
  const prevAutoSwapped = useRef(autoSwapped)

  useEffect(() => {
    if (autoSwapped !== prevAutoSwapped.current) {
      prevAutoSwapped.current = autoSwapped
      setSideToast(true)
      const timer = setTimeout(() => setSideToast(false), 2200)
      return () => clearTimeout(timer)
    }
  }, [autoSwapped])

  function handleTap(player, score) {
    setTap((prev) => ({ player, tick: prev.tick + 1 }))
    score()
  }

  const topPlayer = sidesSwapped ? 'player1' : 'player2'
  const bottomPlayer = sidesSwapped ? 'player2' : 'player1'
  const playerProps = {
    player1: {
      name: player1Name,
      points: currentPoints.player1,
      setsWon: setsWon.player1,
      serving: currentServer === 'player1',
      colorClass: 'bg-player1/10 text-player1',
      onTap: () => handleTap('player1', onScorePlayer1),
    },
    player2: {
      name: player2Name,
      points: currentPoints.player2,
      setsWon: setsWon.player2,
      serving: currentServer === 'player2',
      colorClass: 'bg-player2/10 text-player2',
      onTap: () => handleTap('player2', onScorePlayer2),
    },
  }

  return (
    <div className="relative flex h-full flex-col">
      <PlayerHalf
        key={topPlayer}
        {...playerProps[topPlayer]}
        setsToWin={setsToWin}
        rotate
        active={tap.player === topPlayer}
        tick={tap.tick}
      />

      <div className="relative z-10 flex items-center justify-between gap-2 bg-surface px-3 py-2">
        <button
          type="button"
          onClick={onRequestCancel}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 active:bg-surface-2"
        >
          <XIcon className="h-3.5 w-3.5" />
          Cancelar
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">
            Set {currentSetNumber}
          </span>
          {sets.length > 0 && (
            <span className="mt-0.5 text-[11px] text-gray-400">
              {sets.map((s) => `${s.player1Points}-${s.player2Points}`).join(' · ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSides}
            aria-label="Cambiar lado"
            className="rounded-lg p-2 text-gray-300 active:bg-surface-2"
          >
            <SwapIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 disabled:opacity-30 active:bg-surface-2"
          >
            <UndoIcon className="h-3.5 w-3.5" />
            Deshacer
          </button>
        </div>
      </div>

      <PlayerHalf
        key={bottomPlayer}
        {...playerProps[bottomPlayer]}
        setsToWin={setsToWin}
        active={tap.player === bottomPlayer}
        tick={tap.tick}
      />

      {setBanner && (
        <>
          <div className="set-wipe pointer-events-none absolute inset-y-0 left-0 z-20 w-3/5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          <div className="set-banner absolute left-1/2 top-20 z-30 flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 shadow-lg">
            <CheckIcon className="h-3.5 w-3.5 text-accent" />
            <span className="text-sm font-bold text-gray-100">{setBanner}</span>
          </div>
        </>
      )}

      {sideToast && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 shadow-lg">
          <span className="text-sm font-bold text-gray-100">Cambio de lado</span>
        </div>
      )}
    </div>
  )
}

function PlayerHalf({ name, points, setsWon, setsToWin, serving, colorClass, rotate, active, tick, onTap }) {
  const particles = active ? burstParticles(tick) : []

  return (
    <button
      type="button"
      onClick={onTap}
      className={`side-swap-in flex flex-1 flex-col items-center justify-center gap-3 ${colorClass} active:brightness-125 transition`}
      style={rotate ? { transform: 'rotate(180deg)' } : undefined}
    >
      <span className="flex max-w-[80%] items-center gap-1.5">
        {serving && <BallIcon className="h-4 w-4 shrink-0" />}
        <span className="truncate text-lg font-bold">{name}</span>
      </span>

      <div className="relative inline-flex">
        {active && (
          <div key={tick} className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
            <div
              className="score-ripple absolute left-0 top-0 -m-[75px] h-[150px] w-[150px] rounded-full"
              style={{ background: 'radial-gradient(circle, currentColor, transparent 70%)' }}
            />
            <div className="score-ring absolute left-0 top-0 -m-[60px] h-[120px] w-[120px] rounded-full border-2 border-current" />
            {particles.map((p, i) => (
              <span
                key={i}
                className="spark-dot bg-current"
                style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }}
              />
            ))}
          </div>
        )}
        <span key={points} className="score-pulse relative text-[7rem] font-black leading-none tabular-nums">
          {points}
        </span>
      </div>

      <SetDots won={setsWon} total={setsToWin} />
      <span className="text-xs text-gray-400">Toca para sumar punto</span>
    </button>
  )
}

// La cantidad de puntos representa cuantos sets hacen falta para ganar el
// partido segun el formato (bo1=1, bo3=2, bo5=3, bo7=4), no un 2 fijo.
function SetDots({ won, total }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < won ? 'bg-current' : 'bg-current/20'}`}
        />
      ))}
    </div>
  )
}
