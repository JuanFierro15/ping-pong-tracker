import { MATCH_FORMATS, POINTS_OPTIONS } from '../utils/gameLogic'
import { PaddleAndBallIcon, PingPongBallIcon, ChevronDownIcon } from './icons'

export default function MatchSetup({
  player1Name,
  player2Name,
  onChangePlayer1Name,
  onChangePlayer2Name,
  matchFormat,
  onChangeMatchFormat,
  pointsToWin,
  onChangePointsToWin,
  firstServer,
  onChangeFirstServer,
  onStart,
}) {
  const totalSets = MATCH_FORMATS[matchFormat].totalSets

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="orb-drift-a absolute -left-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
      <div className="orb-drift-b absolute -bottom-24 -right-16 h-60 w-60 rounded-full bg-white/5 blur-2xl" />

      {/* min-h-full en vez de h-full: con los selectores de formato/puntos
          y "saca primero" agregados, el contenido puede superar el alto
          disponible en pantallas bajas (ej. 375x667); el padre ya tiene
          overflow-y-auto para permitir scroll en vez de recortar el boton
          de Iniciar partido o el icono del encabezado. */}
      <div className="relative flex min-h-full flex-col items-center justify-center gap-8 p-6">
        <div className="relative flex flex-col items-center gap-2 text-center">
          <div className="icon-float relative h-[52px] w-[52px]">
            <PaddleAndBallIcon className="h-[46px] w-[46px] text-gray-100" />
            <span className="ball-orbit absolute right-0 top-1.5 h-[11px] w-[11px] rounded-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-100">Nuevo partido</h1>
          <p className="text-sm text-gray-400">
            Al mejor de {totalSets} {totalSets === 1 ? 'set' : 'sets'}, a {pointsToWin} puntos
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="flex gap-3">
            <FormatField value={matchFormat} onChange={onChangeMatchFormat} />
            <PointsField value={pointsToWin} onChange={onChangePointsToWin} />
          </div>
          <PlayerNameField
            label="Jugador 1"
            color="text-player1"
            value={player1Name}
            onChange={onChangePlayer1Name}
          />
          <PlayerNameField
            label="Jugador 2"
            color="text-player2"
            value={player2Name}
            onChange={onChangePlayer2Name}
          />
          <FirstServerField
            player1Name={player1Name}
            player2Name={player2Name}
            value={firstServer}
            onChange={onChangeFirstServer}
          />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-accent py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 active:scale-95 transition"
        >
          <PingPongBallIcon className="h-5 w-5" />
          Iniciar partido
        </button>
      </div>
    </div>
  )
}

function FormatField({ value, onChange }) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-sm font-semibold text-gray-300">Formato</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-surface-2 px-4 py-3 text-base text-gray-100 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
        >
          {Object.entries(MATCH_FORMATS).map(([key, format]) => (
            <option key={key} value={key}>
              {format.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </label>
  )
}

function PointsField({ value, onChange }) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-sm font-semibold text-gray-300">Puntos por set</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none rounded-xl bg-surface-2 px-4 py-3 text-base text-gray-100 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
        >
          {POINTS_OPTIONS.map((points) => (
            <option key={points} value={points}>
              {points}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </label>
  )
}

function FirstServerField({ player1Name, player2Name, value, onChange }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-gray-300">Saca primero</span>
      <div className="flex gap-2">
        <ServerButton
          label={player1Name || 'Jugador 1'}
          active={value === 'player1'}
          onClick={() => onChange('player1')}
        />
        <ServerButton
          label={player2Name || 'Jugador 2'}
          active={value === 'player2'}
          onClick={() => onChange('player2')}
        />
      </div>
    </div>
  )
}

function ServerButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
        active ? 'bg-accent text-white' : 'bg-surface-2 text-gray-300 ring-1 ring-white/10'
      }`}
    >
      {active && <PingPongBallIcon className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{label}</span>
    </button>
  )
}

function PlayerNameField({ label, color, value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      maxLength={20}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={`w-full rounded-xl bg-surface-2 px-4 py-3 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent ${color}`}
      placeholder={label}
    />
  )
}
