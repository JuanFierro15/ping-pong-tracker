import { useState } from 'react'
import { countSetsWon } from '../utils/gameLogic'
import { updateMatchPlayerNames } from '../db'
import { ChevronLeftIcon, PencilIcon, TrophyIcon } from './icons'

export default function MatchDetail({ match, onBack, onRequestDelete, onNamesUpdated }) {
  const [editing, setEditing] = useState(false)
  const [player1Name, setPlayer1Name] = useState(match.player1Name)
  const [player2Name, setPlayer2Name] = useState(match.player2Name)

  const setsWon = countSetsWon(match.sets)
  const winnerName = match.winner === 'player1' ? match.player1Name : match.player2Name

  async function handleSaveNames() {
    const name1 = player1Name.trim() || 'Jugador 1'
    const name2 = player2Name.trim() || 'Jugador 2'
    await updateMatchPlayerNames(match.id, { player1Name: name1, player2Name: name2 })
    setEditing(false)
    onNamesUpdated({ ...match, player1Name: name1, player2Name: name2 })
  }

  function handleCancelEdit() {
    setPlayer1Name(match.player1Name)
    setPlayer2Name(match.player2Name)
    setEditing(false)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 active:bg-surface-2"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Volver
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 active:bg-surface-2"
        >
          Borrar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-gray-500">{formatDate(match.date)}</p>

        {editing ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={player1Name}
              maxLength={20}
              onChange={(e) => setPlayer1Name(e.target.value)}
              className="w-full rounded-lg bg-surface-2 px-3 py-2 text-lg text-gray-900 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              value={player2Name}
              maxLength={20}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className="w-full rounded-lg bg-surface-2 px-3 py-2 text-lg text-gray-900 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 rounded-lg bg-surface-2 py-2 text-sm font-semibold text-gray-700 active:scale-95 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNames}
                className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white active:scale-95 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {match.player1Name} vs {match.player2Name}
            </h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Editar nombres"
              className="shrink-0 rounded-lg p-1.5 text-gray-400 active:bg-surface-2"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="mt-2 flex items-center gap-2 text-lg">
          <span className="flex items-center gap-1.5 font-bold text-accent">
            <TrophyIcon className="h-4 w-4" />
            {winnerName}
          </span>
          <span className="text-gray-500">
            ({setsWon.player1} - {setsWon.player2})
          </span>
        </p>

        <div className="mt-6 space-y-2">
          {match.sets.map((set) => (
            <div
              key={set.setNumber}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <span className="text-sm text-gray-500">Set {set.setNumber}</span>
              <span className="text-lg font-bold tabular-nums">
                <span className={set.winner === 'player1' ? 'text-player1' : 'text-gray-900'}>
                  {set.player1Points}
                </span>
                <span className="text-gray-400"> - </span>
                <span className={set.winner === 'player2' ? 'text-player2' : 'text-gray-900'}>
                  {set.player2Points}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
