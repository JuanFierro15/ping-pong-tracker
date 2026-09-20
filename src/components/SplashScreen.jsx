import { useEffect, useRef, useState } from 'react'
import raqueta from '../assets/raqueta.png'
import pelota from '../assets/pelota.png'

// Debe quedar despues de que termina .splash-ball en index.css (delay
// 480ms + duracion 880ms = 1360ms), con un pequeno solape para que el
// fundido final arranque justo cuando la pelota casi desaparece.
const EXIT_START_MS = 1300
const EXIT_FADE_MS = 280

export default function SplashScreen({ onFinish }) {
  const [exiting, setExiting] = useState(false)
  const finishedRef = useRef(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), EXIT_START_MS)
    return () => clearTimeout(exitTimer)
  }, [])

  useEffect(() => {
    if (!exiting) return
    const finishTimer = setTimeout(() => {
      if (finishedRef.current) return
      finishedRef.current = true
      onFinish()
    }, EXIT_FADE_MS)
    return () => clearTimeout(finishTimer)
  }, [exiting, onFinish])

  function handleSkip() {
    setExiting(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg transition-opacity"
      style={{ opacity: exiting ? 0 : 1, transitionDuration: `${EXIT_FADE_MS}ms` }}
      onClick={handleSkip}
      role="presentation"
    >
      <img src={raqueta} alt="" className="splash-paddle absolute h-40 w-40 object-contain" />
      <img src={pelota} alt="" className="splash-ball absolute h-20 w-20 object-contain" />
    </div>
  )
}
