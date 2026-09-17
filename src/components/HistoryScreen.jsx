import { useEffect, useRef, useState } from 'react'
import { getAllMatches, deleteMatch, importMatches } from '../db'
import { countSetsWon } from '../utils/gameLogic'
import { getHeadToHeadStats, getPlayerTotals } from '../utils/matchStats'
import ConfirmDialog from './ConfirmDialog'
import MatchDetail from './MatchDetail'
import PlayerStatsTab from './PlayerStatsTab'
import HeadToHeadTab from './HeadToHeadTab'
import { DownloadIcon, UploadIcon, TrashIcon, TrophyIcon, ChevronDownIcon } from './icons'

const SUBTABS = [
  { id: 'matches', label: 'Partidos' },
  { id: 'player', label: 'Jugador' },
  { id: 'h2h', label: 'Cara a cara' },
]

export default function HistoryScreen({ active }) {
  const [matches, setMatches] = useState(null)
  const [subTab, setSubTab] = useState('matches')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [matchPendingDelete, setMatchPendingDelete] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (active) refreshMatches()
  }, [active])

  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => setStatusMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [statusMessage])

  async function refreshMatches() {
    const all = await getAllMatches()
    setMatches(all)
  }

  async function handleConfirmDelete() {
    const id = matchPendingDelete.id
    setMatchPendingDelete(null)
    if (selectedMatch?.id === id) setSelectedMatch(null)
    await deleteMatch(id)
    await refreshMatches()
  }

  async function handleExport() {
    const all = await getAllMatches()
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ping-pong-historial-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setStatusMessage(`Se exportaron ${all.length} partido(s).`)
  }

  async function handleImportFile(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const { imported, skipped } = await importMatches(parsed)
      await refreshMatches()
      setStatusMessage(
        `Se importaron ${imported} partido(s)` +
          (skipped > 0 ? `, se omitieron ${skipped} inválido(s).` : '.')
      )
    } catch {
      setStatusMessage('No se pudo leer el archivo. Verifica que sea un JSON exportado desde esta app.')
    }
  }

  function handleNamesUpdated(updatedMatch) {
    setSelectedMatch(updatedMatch)
    setMatches((prev) => prev?.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)) ?? prev)
  }

  const playerTotals = matches ? getPlayerTotals(matches) : []
  const headToHeadStats = matches ? getHeadToHeadStats(matches) : []
  const roster = playerTotals.map((p) => p.name)

  return (
    <div className="flex h-full flex-col">
      {selectedMatch ? (
        <MatchDetail
          match={selectedMatch}
          onBack={() => setSelectedMatch(null)}
          onRequestDelete={() => setMatchPendingDelete(selectedMatch)}
          onNamesUpdated={handleNamesUpdated}
        />
      ) : (
        <>
          <header className="flex items-center justify-between px-5 pb-2.5 pt-4">
            <h1 className="text-xl font-extrabold text-gray-900">Historial</h1>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleExport}
                aria-label="Exportar historial"
                className="rounded-lg p-2 active:bg-surface-2"
              >
                <DownloadIcon className="h-4 w-4 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Importar historial"
                className="rounded-lg p-2 active:bg-surface-2"
              >
                <UploadIcon className="h-4 w-4 text-gray-500" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </header>

          <div className="flex gap-1.5 px-4 pb-3">
            {SUBTABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  subTab === tab.id ? 'bg-accent text-white shadow-md shadow-accent/30' : 'bg-surface-2 text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {statusMessage && (
              <div className="mb-3 rounded-lg bg-surface-2 px-3 py-2 text-sm text-gray-700">{statusMessage}</div>
            )}

            {matches === null && <p className="mt-8 text-center text-gray-400">Cargando…</p>}

            {matches !== null && subTab === 'matches' && (
              <MatchesTab
                matches={matches}
                roster={roster}
                onOpen={setSelectedMatch}
                onDelete={setMatchPendingDelete}
              />
            )}

            {matches !== null && subTab === 'player' && <PlayerStatsTab playerTotals={playerTotals} />}

            {matches !== null && subTab === 'h2h' && (
              <HeadToHeadTab roster={roster} headToHeadStats={headToHeadStats} />
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        theme="light"
        open={Boolean(matchPendingDelete)}
        title="¿Borrar partido?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        onCancel={() => setMatchPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

function MatchesTab({ matches, roster, onOpen, onDelete }) {
  const [playerFilter, setPlayerFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  if (matches.length === 0) {
    return (
      <p className="mt-8 text-center text-gray-400">
        Todavía no hay partidos guardados. ¡Juega el primero!
      </p>
    )
  }

  const fromBound = fromDate ? new Date(`${fromDate}T00:00:00`) : null
  const toBound = toDate ? new Date(`${toDate}T23:59:59.999`) : null

  const filteredMatches = matches.filter((m) => {
    if (playerFilter && m.player1Name !== playerFilter && m.player2Name !== playerFilter) return false
    const matchDate = new Date(m.date)
    if (fromBound && matchDate < fromBound) return false
    if (toBound && matchDate > toBound) return false
    return true
  })

  return (
    <div>
      <div className="relative mb-2.5">
        <select
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
          className="w-full appearance-none rounded-xl bg-surface px-3.5 py-2.5 text-sm font-bold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] outline-none"
        >
          <option value="">Todos los jugadores</option>
          {roster.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="mb-3 flex gap-2">
        <label className="flex-1 text-xs text-gray-500">
          Desde
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] outline-none"
          />
        </label>
        <label className="flex-1 text-xs text-gray-500">
          Hasta
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface">
        {filteredMatches.map((match, i) => (
          <MatchListItem
            key={match.id}
            match={match}
            isLast={i === filteredMatches.length - 1}
            onOpen={() => onOpen(match)}
            onDelete={() => onDelete(match)}
          />
        ))}
      </div>
    </div>
  )
}

function MatchListItem({ match, isLast, onOpen, onDelete }) {
  const setsWon = countSetsWon(match.sets)
  const winnerName = match.winner === 'player1' ? match.player1Name : match.player2Name

  return (
    <div className={`flex items-stretch gap-1 ${isLast ? '' : 'border-b border-black/10'}`}>
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 px-4 py-3 text-left active:bg-surface-2 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatDate(match.date)}</span>
          <span className="text-base font-bold tabular-nums text-gray-900">
            {setsWon.player1} - {setsWon.player2}
          </span>
        </div>
        <div className="mt-0.5 text-sm font-semibold text-gray-900">
          {match.player1Name} vs {match.player2Name}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-accent">
          <TrophyIcon className="h-3 w-3" />
          {winnerName}
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Borrar partido"
        className="w-11 shrink-0 flex items-center justify-center text-red-500 active:bg-surface-2 transition"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
