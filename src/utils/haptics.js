function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function vibratePoint() {
  vibrate(15)
}

export function vibrateSetWon() {
  vibrate([40, 40, 40])
}

export function vibrateMatchWon() {
  vibrate([80, 40, 80, 40, 160])
}
