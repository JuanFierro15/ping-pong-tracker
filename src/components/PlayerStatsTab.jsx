import { useEffect, useState } from 'react'
import { ChevronDownIcon } from './icons'
import EmptyState from './EmptyState'

export default function PlayerStatsTab({ playerTotals }) {
  const roster = playerTotals.map((p) => p.name)
  const [selected, setSelected] = useState(roster[0] ?? '')

  useEffect(() => {
    if (roster.length > 0 && !roster.includes(selected)) {
      setSelected(roster[0])
    }
    // Solo nos interesa reaccionar a cambios en el roster disponible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster.join('|')])

  if (playerTotals.length === 0) {
    return <EmptyState message="Aún no hay partidos jugados" />
  }

  const stats = playerTotals.find((p) => p.name === selected) ?? playerTotals[0]

  return (
    <div>
      <div className="relative mb-3.5">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full appearance-none rounded-xl bg-surface px-3.5 py-2.5 text-sm font-bold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] outline-none"
        >
          {playerTotals.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div key={selected} className="grid grid-cols-2 gap-2.5">
        <StatTile
          value={`${stats.matchesWon}/${stats.matchesPlayed}`}
          label="Partidos ganados"
          delay={0}
        />
        <StatTile value={`${stats.setsWon}-${stats.setsLost}`} label="Sets ganados" delay={60} />
        <StatTile
          className="col-span-2"
          value={stats.totalPoints}
          label="Puntos anotados en total"
          delay={120}
        />
      </div>
    </div>
  )
}

function StatTile({ value, label, className = '', delay = 0 }) {
  return (
    <div
      className={`row-in flex flex-col gap-0.5 rounded-xl bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-lg font-extrabold tabular-nums text-gray-900">{value}</span>
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-600">{label}</span>
    </div>
  )
}
