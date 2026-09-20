import { useEffect, useRef, useState } from 'react'
import raqueta from '../assets/raqueta.png'
import pelota from '../assets/pelota.png'

// Coincide con el arranque del propio fundido de .splash-ball en index.css
// (empieza en el keyframe 88% de una animacion con delay 250ms + duracion
// 1150ms => 250 + 0.88*1150 = 1262ms), para que el fundido del overlay se
// superponga con el de la pelota en vez de dejar un salto entre ambos.
const EXIT_START_MS = 1260
const EXIT_FADE_MS = 300

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
