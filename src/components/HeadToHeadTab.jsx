import { useEffect, useState } from 'react'
import { ChevronDownIcon } from './icons'
import EmptyState from './EmptyState'

function normalizeKey(name) {
  return name.trim().toLowerCase()
}

// El registro de un enfrentamiento no sabe cuál jugador es "A" o "B" en la
// selección actual del usuario: lo reordena según quién eligió como A.
function orientPair(entry, playerA) {
  const aIsFirst = normalizeKey(entry.playerA) === normalizeKey(playerA)
  return aIsFirst
    ? { matchesA: entry.winsA, matchesB: entry.winsB, setsA: entry.setsA, setsB: entry.setsB, pointsA: entry.pointsA, pointsB: entry.pointsB }
    : { matchesA: entry.winsB, matchesB: entry.winsA, setsA: entry.setsB, setsB: entry.setsA, pointsA: entry.pointsB, pointsB: entry.pointsA }
}

export default function HeadToHeadTab({ roster, headToHeadStats }) {
  const [playerA, setPlayerA] = useState(roster[0] ?? '')
  const [playerB, setPlayerB] = useState(roster[1] ?? roster[0] ?? '')

  useEffect(() => {
    if (roster.length === 0) return
    if (!roster.includes(playerA)) setPlayerA(roster[0])
    if (!roster.includes(playerB)) setPlayerB(roster[1] ?? roster[0])
    // Solo nos interesa reaccionar a cambios en el roster disponible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster.join('|')])

  if (roster.length === 0) {
    return <EmptyState message="Aún no hay partidos jugados" />
  }

  const sameSelection = playerA && playerB && normalizeKey(playerA) === normalizeKey(playerB)
  const entry = !sameSelection
    ? headToHeadStats.find((h) => {
        const keys = [normalizeKey(h.playerA), normalizeKey(h.playerB)]
        return keys.includes(normalizeKey(playerA)) && keys.includes(normalizeKey(playerB))
      })
    : null
  const oriented = entry ? orientPair(entry, playerA) : null
  const winRateA = oriented ? (oriented.matchesA / entry.totalMatches) * 100 : null
  const winRateB = oriented ? (oriented.matchesB / entry.totalMatches) * 100 : null

  return (
    <div>
      <div className="mb-3.5 flex gap-2">
        <PlayerSelect roster={roster} value={playerA} onChange={setPlayerA} />
        <PlayerSelect roster={roster} value={playerB} onChange={setPlayerB} />
      </div>

      {sameSelection && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Elige dos jugadores distintos para comparar.
        </p>
      )}

      {!sameSelection && !oriented && <EmptyState message="Aún no se han enfrentado" />}

      {!sameSelection && oriented && (
        <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
          <Row label="Partidos ganados" a={oriented.matchesA} b={oriented.matchesB} />
          <WinRateRow winRateA={winRateA} winRateB={winRateB} />
          <Row label="Sets ganados" a={oriented.setsA} b={oriented.setsB} />
          <div className="h-px bg-black/10" />
          <div>
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-gray-600">
              Puntos anotados en total
            </div>
            <div className="text-sm font-bold tabular-nums text-gray-900">
              {playerA}: {oriented.pointsA} pts &middot; {playerB}: {oriented.pointsB} pts
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerSelect({ roster, value, onChange }) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl bg-surface px-3.5 py-2.5 text-sm font-bold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] outline-none"
      >
        {roster.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  )
}

function Row({ label, a, b }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-extrabold tabular-nums text-gray-900">
        {a} - {b}
      </span>
    </div>
  )
}

// Verde para quien lleva ventaja en el enfrentamiento, rojo para el otro;
// si están empatados 50%/50% ambos se muestran en azul.
function winRateColor(rate, otherRate) {
  if (rate === otherRate) return 'text-blue-600'
  return rate > otherRate ? 'text-green-600' : 'text-red-600'
}

function WinRateRow({ winRateA, winRateB }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">Winrate</span>
      <span className="font-extrabold tabular-nums">
        <span className={winRateColor(winRateA, winRateB)}>{Math.round(winRateA)}%</span>
        <span className="text-gray-400"> - </span>
        <span className={winRateColor(winRateB, winRateA)}>{Math.round(winRateB)}%</span>
      </span>
    </div>
  )
}
