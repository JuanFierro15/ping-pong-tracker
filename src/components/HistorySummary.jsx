import { useMemo, useState } from 'react'
import { getHeadToHeadStats, getPlayerTotals } from '../utils/matchStats'

export default function HistorySummary({ matches }) {
  const [open, setOpen] = useState(true)

  const playerTotals = useMemo(() => getPlayerTotals(matches), [matches])
  const headToHead = useMemo(() => getHeadToHeadStats(matches), [matches])

  return (
    <div className="mb-3 rounded-xl bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="text-sm font-bold text-gray-200">📊 Resumen</span>
        <span className="text-xs text-gray-500">{open ? 'Ocultar ▲' : 'Ver ▼'}</span>
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cara a cara
            </h3>
            <div className="space-y-2">
              {headToHead.map((h) => (
                <div
                  key={`${h.playerA}-${h.playerB}`}
                  className="rounded-lg bg-surface-2 px-3 py-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-100">
                      {h.playerA} <span className="text-gray-500">vs</span> {h.playerB}
                    </span>
                    <span className="font-bold tabular-nums text-gray-100">
                      {h.winsA} - {h.winsB}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {h.totalMatches} partido{h.totalMatches !== 1 ? 's' : ''} · sets {h.setsA}-
                    {h.setsB}
                    {h.streak && h.streak.count >= 2 && (
                      <span className="ml-2 text-amber-500">
                        🔥 {h.streak.name} lleva {h.streak.count} seguidas
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Totales por jugador
            </h3>
            <div className="space-y-1.5">
              {playerTotals.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-200">{p.name}</span>
                  <span className="text-gray-400">
                    <span className="font-semibold text-gray-100">
                      {p.matchesWon}/{p.matchesPlayed}
                    </span>{' '}
                    partidos · {p.setsWon}-{p.setsLost} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
