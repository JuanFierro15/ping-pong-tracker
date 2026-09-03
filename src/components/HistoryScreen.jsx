import { useEffect, useRef, useState } from 'react'
import { getAllMatches, deleteMatch, importMatches } from '../db'
import { countSetsWon } from '../utils/gameLogic'
import ConfirmDialog from './ConfirmDialog'
import MatchDetail from './MatchDetail'
import HistorySummary from './HistorySummary'

export default function HistoryScreen({ active }) {
  const [matches, setMatches] = useState(null)
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

  if (selectedMatch) {
    return (
      <MatchDetail
        match={selectedMatch}
        onBack={() => setSelectedMatch(null)}
        onRequestDelete={() => setMatchPendingDelete(selectedMatch)}
        onNamesUpdated={handleNamesUpdated}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h1 className="text-xl font-extrabold text-gray-100">Historial</h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleExport}
            aria-label="Exportar historial"
            className="rounded-lg px-2 py-1.5 text-lg active:bg-surface-2"
          >
            ⬇️
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Importar historial"
            className="rounded-lg px-2 py-1.5 text-lg active:bg-surface-2"
          >
            ⬆️
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

      {statusMessage && (
        <div className="mx-4 mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm text-gray-200">
          {statusMessage}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {matches === null && <p className="mt-8 text-center text-gray-500">Cargando…</p>}

        {matches?.length === 0 && (
          <p className="mt-8 text-center text-gray-500">
            Todavía no hay partidos guardados. ¡Juega el primero!
          </p>
        )}

        {matches?.length > 0 && <HistorySummary matches={matches} />}

        <div className="space-y-3">
          {matches?.map((match) => (
            <MatchListItem
              key={match.id}
              match={match}
              onOpen={() => setSelectedMatch(match)}
              onDelete={() => setMatchPendingDelete(match)}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
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

function MatchListItem({ match, onOpen, onDelete }) {
  const setsWon = countSetsWon(match.sets)
  const winnerName = match.winner === 'player1' ? match.player1Name : match.player2Name

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 rounded-xl bg-surface px-4 py-3 text-left active:bg-surface-2 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{formatDate(match.date)}</span>
          <span className="text-lg font-bold tabular-nums text-gray-100">
            {setsWon.player1} - {setsWon.player2}
          </span>
        </div>
        <div className="mt-1 text-base font-semibold text-gray-100">
          {match.player1Name} vs {match.player2Name}
        </div>
        <div className="mt-0.5 text-sm text-emerald-500">🏆 {winnerName}</div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Borrar partido"
        className="w-12 shrink-0 rounded-xl bg-surface text-red-500 active:bg-surface-2 transition"
      >
        🗑
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
