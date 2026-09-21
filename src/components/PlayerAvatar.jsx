// Insignia de jugador: si hay un avatar personalizado (emoji + color) lo
// pinta con ese color exacto; si no, cae a la identidad naranja/blanca por
// defecto (clase de color pasada por el caller, atada a los temas de la app).
export default function PlayerAvatar({ avatar, fallbackClass, fallbackEmoji = '🏓', className = 'h-8 w-8 text-base' }) {
  const color = avatar?.color
  const style = color
    ? { backgroundColor: `${color}26`, color, boxShadow: `inset 0 0 0 1.5px ${color}` }
    : undefined

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full leading-none ${className} ${
        color ? '' : fallbackClass
      }`}
      style={style}
    >
      {avatar?.emoji || fallbackEmoji}
    </span>
  )
}
