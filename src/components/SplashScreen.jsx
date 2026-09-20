import { useEffect, useRef, useState } from 'react'
import raqueta from '../assets/raqueta.png'
import pelota from '../assets/pelota.png'

// Duración total pensada para sentirse rápida: swing de la raqueta, golpe
// que lanza la pelota hacia la cámara, y fundido final hacia la pantalla
// principal. EXIT_FADE_MS es cuánto dura ese fundido final.
const EXIT_START_MS = 1250
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
      <img src={raqueta} alt="" className="absolute h-40 w-40 object-contain" />
      <img src={pelota} alt="" className="absolute h-20 w-20 object-contain" />
    </div>
  )
}
