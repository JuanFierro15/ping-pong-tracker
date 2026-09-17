import { PaddleAndBallIcon, BallIcon } from './icons'

export default function MatchSetup({
  player1Name,
  player2Name,
  onChangePlayer1Name,
  onChangePlayer2Name,
  onStart,
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <PaddleAndBallIcon className="h-11 w-11 text-gray-100" />
        <h1 className="text-2xl font-extrabold text-gray-100">Nuevo partido</h1>
        <p className="text-sm text-gray-400">Al mejor de 3 sets, a 11 puntos</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
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
      </div>

      <button
        type="button"
        onClick={onStart}
        className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-accent py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 active:scale-95 transition"
      >
        <BallIcon className="h-5 w-5" />
        Iniciar partido
      </button>
    </div>
  )
}

function PlayerNameField({ label, color, value, onChange }) {
  return (
    <label className="block">
      <span className={`mb-1 block text-sm font-semibold ${color}`}>{label}</span>
      <input
        type="text"
        value={value}
        maxLength={20}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-surface-2 px-4 py-3 text-lg text-gray-100 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
        placeholder={label}
      />
    </label>
  )
}
