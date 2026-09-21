// Paleta acotada de colores de acento para personalizar a cada jugador
// (independiente del naranja/blanco por defecto de la pelota). Los valores
// son hex directos (no clases de Tailwind) porque se eligen en tiempo de
// ejecución y se guardan por partido: una clase como `bg-${color}` no la
// detectaría el escaneo de Tailwind en el build de producción.
export const AVATAR_COLORS = [
  { key: 'orange', hex: '#f97316' },
  { key: 'red', hex: '#ef4444' },
  { key: 'yellow', hex: '#eab308' },
  { key: 'green', hex: '#22c55e' },
  { key: 'cyan', hex: '#06b6d4' },
  { key: 'blue', hex: '#3b82f6' },
  { key: 'purple', hex: '#a855f7' },
  { key: 'pink', hex: '#ec4899' },
]

export const AVATAR_EMOJIS = ['🏓', '😀', '😎', '🔥', '⭐', '🐯', '🦁', '🐉', '🚀', '👑', '💪', '🎯']

// null = sin avatar personalizado: la app cae al naranja/blanco por defecto
// de --color-player1/--color-player2 (ver PlayerAvatar).
export const DEFAULT_AVATAR = null
