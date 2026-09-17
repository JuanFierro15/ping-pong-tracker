import { BallIcon } from './icons'

// Estado vacío compartido para las pestañas del Historial (Partidos,
// Jugador, Cara a cara) cuando todavía no hay datos que mostrar.
export default function EmptyState({ message, icon: Icon = BallIcon }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-2 text-center">
      <Icon className="h-8 w-8 text-gray-300" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}
