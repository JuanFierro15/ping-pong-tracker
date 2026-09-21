// Beeps sintetizados con Web Audio API (sin archivos de audio: la app es
// offline-first, asi que no hace falta empaquetar ni descargar nada).
//
// Se reutiliza un unico AudioContext entre llamadas en vez de crear uno
// nuevo cada vez. Es importante para el beep de fin de time-out, que se
// dispara 60s despues del toque que inicio el time-out (no dentro de ese
// mismo gesto del usuario): crear el context la primera vez SI ocurre
// dentro de un gesto (el toque de "Time-out"), y los navegadores permiten
// seguir usando ese mismo context ya desbloqueado despues, aunque la
// llamada puntual no venga de un gesto directo.
let sharedContext = null

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContextClass()
  }
  // El sistema operativo suele suspender el hilo de audio tras un rato
  // sin interaccion tactil (los 60s del time-out sin que nadie toque la
  // pantalla son un caso tipico): sin este resume(), el beep de fin
  // quedaria mudo en silencio en vez de sonar.
  if (sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {})
  }
  return sharedContext
}

function beep(ctx, { frequency = 880, duration = 0.15, volume = 0.2, delay = 0 } = {}) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.value = volume
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  const startAt = ctx.currentTime + delay
  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

export function playTimeoutStart() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    beep(ctx, { frequency: 880, duration: 0.15 })
  } catch {
    // Sin Web Audio disponible, el time-out sigue funcionando sin sonido.
  }
}

export function playTimeoutEnd() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    // Dos beeps mas agudos, para distinguirlo claramente del de inicio.
    beep(ctx, { frequency: 1046, duration: 0.12 })
    beep(ctx, { frequency: 1046, duration: 0.12, delay: 0.18 })
  } catch {
    // Sin Web Audio disponible, el time-out sigue funcionando sin sonido.
  }
}
