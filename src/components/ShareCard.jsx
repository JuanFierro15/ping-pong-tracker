import { forwardRef } from 'react'
import { countSetsWon, MATCH_FORMATS, DEFAULT_MATCH_FORMAT, DEFAULT_POINTS_TO_WIN } from '../utils/gameLogic'

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1920

// Poster del resultado, renderizado fuera de pantalla para que html-to-image
// pueda capturarlo en cualquier momento sin que el usuario lo vea. Usa
// estilos inline (no clases de Tailwind) para tener control exacto del
// layout a resolucion fija, sin depender de que Tailwind haya generado esas
// clases en el build.
const ShareCard = forwardRef(function ShareCard({ match }, ref) {
  if (!match) return null

  const {
    player1Name,
    player2Name,
    player1Avatar,
    player2Avatar,
    sets,
    winner,
    matchFormat,
    pointsToWin,
    date,
  } = match

  const setsWon = countSetsWon(sets)
  const winnerName = winner === 'player1' ? player1Name : player2Name
  const format = MATCH_FORMATS[matchFormat] ? matchFormat : DEFAULT_MATCH_FORMAT
  const points = pointsToWin ?? DEFAULT_POINTS_TO_WIN

  return (
    // Envoltorio con tamaño cero y overflow oculto: mantiene la tarjeta
    // fuera de la vista sin un offset negativo enorme, que en el WebView de
    // Android hace que html-to-image capture un lienzo en blanco (el nodo
    // queda fuera del area que el motor efectivamente rasteriza).
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <div
        ref={ref}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: '#0b1f15',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '96px 72px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#f5f5f0',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 6, color: '#f97316', textTransform: 'uppercase' }}>
            Ping Pong Tracker
          </div>
          <div style={{ marginTop: 14, fontSize: 28, color: 'rgba(245,245,240,0.55)' }}>
            {MATCH_FORMATS[format].label} · a {points} puntos
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, alignItems: 'stretch' }}>
          <PlayerRow name={player1Name} avatar={player1Avatar} sets={setsWon.player1} isWinner={winner === 'player1'} />
          <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 900, color: 'rgba(245,245,240,0.3)' }}>VS</div>
          <PlayerRow name={player2Name} avatar={player2Avatar} sets={setsWon.player2} isWinner={winner === 'player2'} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f97316' }}>🏆 {winnerName} gana el partido</div>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sets.map((set) => (
              <div
                key={set.setNumber}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 28,
                  padding: '18px 32px',
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: 'rgba(245,245,240,0.55)' }}>Set {set.setNumber}</span>
                <span style={{ fontWeight: 800 }}>
                  {set.player1Points} - {set.player2Points}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 44, fontSize: 24, color: 'rgba(245,245,240,0.4)' }}>{formatDate(date)}</div>
        </div>
      </div>
    </div>
  )
})

function PlayerRow({ name, avatar, sets, isWinner }) {
  const color = avatar?.color || '#f97316'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div
        style={{
          width: 152,
          height: 152,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 76,
          flexShrink: 0,
          backgroundColor: `${color}26`,
          boxShadow: `inset 0 0 0 4px ${color}`,
        }}
      >
        {avatar?.emoji || '🏓'}
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontSize: 46,
            fontWeight: 800,
            color: isWinner ? color : '#f5f5f0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
        <span style={{ fontSize: 30, color: 'rgba(245,245,240,0.5)' }}>{sets} sets</span>
      </div>
      {isWinner && <span style={{ fontSize: 52, flexShrink: 0 }}>👑</span>}
    </div>
  )
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default ShareCard
