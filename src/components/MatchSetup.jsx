import { PaddleAndBallIcon, BallIcon } from './icons'

export default function MatchSetup({
  player1Name,
  player2Name,
  onChangePlayer1Name,
  onChangePlayer2Name,
  onStart,
}) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <div className="orb-drift-a absolute -left-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
      <div className="orb-drift-b absolute -bottom-24 -right-16 h-60 w-60 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col items-center gap-2 text-center">
        <div className="icon-float relative h-[52px] w-[52px]">
          <PaddleAndBallIcon className="h-[46px] w-[46px] text-gray-100" />
          <span className="ball-orbit absolute right-0 top-1.5 h-[11px] w-[11px] rounded-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        </div>
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
